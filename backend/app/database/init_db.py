import sqlite3
import json
import os
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.database.database import engine, Base, SessionLocal
from backend.app.database.models import (
    User, Institution, Cafeteria, Meal, InferenceLog,
    DetectionObject, Recommendation, Notification
)

def run_migrations():
    """Ensures tables and supplementary columns exist without altering original data."""
    # First create all tables registered in Base
    Base.metadata.create_all(bind=engine)

    # If SQLite, ensure supplementary columns in inference_logs if created previously with old schema
    if settings.DATABASE_URL.startswith("sqlite"):
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(inference_logs)")
            existing_cols = [col[1] for col in cursor.fetchall()]
            
            supplementary = [
                ("original_image_path", "TEXT"),
                ("annotated_image_path", "TEXT"),
                ("clustering_image_path", "TEXT"),
                ("usable_plate_area", "INTEGER"),
                ("plate_detected", "BOOLEAN DEFAULT 1"),
                ("detection_status", "TEXT DEFAULT 'success'"),
                ("cafeteria_id", "INTEGER"),
                ("meal_id", "INTEGER"),
                ("created_by", "TEXT")
            ]
            for col_name, col_type in supplementary:
                if col_name not in existing_cols:
                    try:
                        cursor.execute(f"ALTER TABLE inference_logs ADD COLUMN {col_name} {col_type}")
                    except Exception as e:
                        print(f"Column migration notice ({col_name}): {e}")
            conn.commit()
            conn.close()

def seed_database():
    """Seeds initial institution, admin, cafeterias, meals, and sample scans."""
    run_migrations()
    db = SessionLocal()
    try:
        # 1. Institution
        inst = db.query(Institution).first()
        if not inst:
            inst = Institution(
                name="Institute of Technology & Management Dining Services",
                code="ITM-DS-01",
                contact_email="sustainability@itm-dining.edu"
            )
            db.add(inst)
            db.commit()
            db.refresh(inst)

        # 2. Users (Super Admin, Institution Admin, Cafeteria Manager, Staff, Researcher)
        admin_user = db.query(User).filter_by(email="admin@foodwise.ai").first()
        if not admin_user:
            users_to_seed = [
                User(
                    email="admin@foodwise.ai",
                    password_hash=hash_password("Admin@1234"),
                    full_name="Dr. Eleanor Vance",
                    role="Super Admin",
                    institution_id=inst.id
                ),
                User(
                    email="manager@foodwise.ai",
                    password_hash=hash_password("Manager@1234"),
                    full_name="Carlos Mendez",
                    role="Cafeteria Manager",
                    institution_id=inst.id
                ),
                User(
                    email="staff@foodwise.ai",
                    password_hash=hash_password("Staff@1234"),
                    full_name="Amina Patel",
                    role="Staff",
                    institution_id=inst.id
                ),
                User(
                    email="researcher@foodwise.ai",
                    password_hash=hash_password("Research@1234"),
                    full_name="Prof. Jorge Ribeiro",
                    role="Researcher",
                    institution_id=inst.id
                )
            ]
            db.add_all(users_to_seed)
            db.commit()

        # 3. Cafeterias
        cafeterias = db.query(Cafeteria).all()
        if not cafeterias:
            cafeterias_to_seed = [
                Cafeteria(
                    institution_id=inst.id,
                    name="Central Student Dining Commons",
                    code="CAF-CENTRAL",
                    campus_location="Building C, Ground Floor",
                    daily_capacity=1200,
                    status="active"
                ),
                Cafeteria(
                    institution_id=inst.id,
                    name="Faculty & Graduate Club Dining",
                    code="CAF-FACULTY",
                    campus_location="Academic Complex West",
                    daily_capacity=450,
                    status="active"
                ),
                Cafeteria(
                    institution_id=inst.id,
                    name="North Campus Residence Canteen",
                    code="CAF-NORTH",
                    campus_location="Residence Hall 4",
                    daily_capacity=800,
                    status="active"
                )
            ]
            db.add_all(cafeterias_to_seed)
            db.commit()
            cafeterias = db.query(Cafeteria).all()

        # 4. Meals over past 14 days
        existing_meals = db.query(Meal).count()
        if existing_meals == 0:
            now = datetime.now()
            meal_sessions = ["Breakfast", "Lunch", "Dinner"]
            menu_samples = {
                "Breakfast": ["Scrambled Eggs", "Toasted Bread", "Cereals", "Apple", "Coffee"],
                "Lunch": ["Rice", "Grilled Chicken", "Steamed Vegetables", "Beans", "Salad"],
                "Dinner": ["Pasta", "Fish Fillet", "Mashed Potatoes", "Brocolis", "Gelatin"]
            }
            meals_to_add = []
            for day_offset in range(14, 0, -1):
                date_str = (now - timedelta(days=day_offset)).strftime("%Y-%m-%d")
                for session in meal_sessions:
                    for caf in cafeterias:
                        served = 200 + (hash(f"{date_str}-{session}-{caf.id}") % 150)
                        returned = int(served * 0.94)
                        waste_wt = round(float(20 + (hash(f"wt-{date_str}-{caf.id}") % 30)), 1)
                        meals_to_add.append(Meal(
                            cafeteria_id=caf.id,
                            meal_date=date_str,
                            meal_session=session,
                            menu_items=json.dumps(menu_samples[session]),
                            plates_served=served,
                            plates_returned=returned,
                            waste_weight_grams=waste_wt * 1000,
                            recorded_by="Staff"
                        ))
            db.add_all(meals_to_add)
            db.commit()

        # 5. Seed initial detection records if table is empty
        scans_count = db.query(InferenceLog).count()
        if scans_count == 0:
            sample_images = list(settings.SAMPLE_DIR.glob("*.jpg"))
            if not sample_images:
                sample_images = list(settings.SAMPLE_DIR.glob("*.png"))
            
            # Realistic historical plate scan data matching research classes
            historical_data = [
                {"classes": ["rice", "chicken", "plate", "fork"], "cats": ["Cereals and Starches", "Protein and Meat", "Non-edible Materials"], "waste": 28.4, "food_px": 64200, "plate_px": 235000, "garbage_px": 8900, "days_ago": 12},
                {"classes": ["bread", "beans", "plate"], "cats": ["Cereals and Starches", "Vegetables"], "waste": 14.2, "food_px": 31500, "plate_px": 222000, "garbage_px": 0, "days_ago": 11},
                {"classes": ["french fries", "steak", "plate", "knife"], "cats": ["Cereals and Starches", "Protein and Meat", "Non-edible Materials"], "waste": 36.8, "food_px": 88000, "plate_px": 245000, "garbage_px": 5600, "days_ago": 10},
                {"classes": ["pasta", "vegetables", "plate"], "cats": ["Cereals and Starches", "Vegetables"], "waste": 22.1, "food_px": 48900, "plate_px": 221000, "garbage_px": 0, "days_ago": 9},
                {"classes": ["fish", "mashed potatoes", "plate", "fork"], "cats": ["Protein and Meat", "Cereals and Starches", "Non-edible Materials"], "waste": 19.5, "food_px": 43200, "plate_px": 228000, "garbage_px": 6200, "days_ago": 8},
                {"classes": ["rice", "beans", "cabbage", "plate"], "cats": ["Cereals and Starches", "Vegetables"], "waste": 31.0, "food_px": 71300, "plate_px": 230000, "garbage_px": 0, "days_ago": 7},
                {"classes": ["chicken steak", "salad", "plate"], "cats": ["Protein and Meat", "Vegetables"], "waste": 16.7, "food_px": 37200, "plate_px": 223000, "garbage_px": 0, "days_ago": 6},
                {"classes": ["rice", "fish hake", "plate", "spoon"], "cats": ["Cereals and Starches", "Protein and Meat", "Non-edible Materials"], "waste": 25.3, "food_px": 58400, "plate_px": 231000, "garbage_px": 4800, "days_ago": 5},
                {"classes": ["spaghetti", "meatballs", "plate"], "cats": ["Cereals and Starches", "Protein and Meat"], "waste": 29.8, "food_px": 68500, "plate_px": 230000, "garbage_px": 0, "days_ago": 4},
                {"classes": ["vegetables", "boiled egg", "plate"], "cats": ["Vegetables", "Protein and Meat"], "waste": 11.4, "food_px": 24800, "plate_px": 218000, "garbage_px": 0, "days_ago": 3},
                {"classes": ["rice", "pork", "greens", "plate"], "cats": ["Cereals and Starches", "Protein and Meat", "Vegetables"], "waste": 33.2, "food_px": 77400, "plate_px": 233000, "garbage_px": 0, "days_ago": 2},
                {"classes": ["breaded", "carrot", "plate"], "cats": ["Protein and Meat", "Vegetables"], "waste": 18.9, "food_px": 41200, "plate_px": 218000, "garbage_px": 0, "days_ago": 1},
                {"classes": ["rice", "chicken", "plate"], "cats": ["Cereals and Starches", "Protein and Meat"], "waste": 27.6, "food_px": 63500, "plate_px": 230000, "garbage_px": 0, "days_ago": 0}
            ]

            now = datetime.now()
            for idx, item in enumerate(historical_data):
                scan_date = now - timedelta(days=item["days_ago"], hours=idx % 6)
                ts_str = scan_date.strftime("%Y-%m-%d %H:%M:%S")
                
                # Copy a sample image if available
                img_name = f"sample_plate_{idx+1}.jpg"
                dest_orig = settings.UPLOADS_DIR / img_name
                if sample_images:
                    src_sample = sample_images[idx % len(sample_images)]
                    try:
                        shutil.copy(src_sample, dest_orig)
                    except Exception:
                        pass

                conf_scores = {c: round(0.78 + (idx * 0.013) % 0.19, 3) for c in item["classes"]}
                
                log = InferenceLog(
                    timestamp=ts_str,
                    image_filename=img_name,
                    detected_classes=json.dumps(item["classes"]),
                    confidence_scores=json.dumps(conf_scores),
                    categories=json.dumps(item["cats"]),
                    waste_percentage=item["waste"],
                    food_area=item["food_px"],
                    plate_area=item["plate_px"],
                    garbage_area=item["garbage_px"],
                    usable_plate_area=item["plate_px"] - item["garbage_px"],
                    plate_detected=True,
                    detection_status="success",
                    model_version="YOLOv11-seg (best.pt)",
                    original_image_path=f"/static/uploads/{img_name}",
                    annotated_image_path=f"/static/uploads/{img_name}",
                    clustering_image_path=f"/static/uploads/{img_name}",
                    cafeteria_id=cafeterias[idx % len(cafeterias)].id,
                    created_by="Dr. Eleanor Vance"
                )
                db.add(log)
                db.flush()

                for c in item["classes"]:
                    obj = DetectionObject(
                        detection_id=log.id,
                        class_id=58 if c == "plate" else (35 if c == "garbage" else 63),
                        class_name=c,
                        category="Plate / Utensil" if c in ["plate", "fork", "knife", "spoon"] else ("Cereals and Starches" if c in ["rice", "bread", "pasta", "french fries", "spaghetti"] else "Protein and Meat"),
                        semantic_type="plate_or_utensil" if c in ["plate", "fork", "knife", "spoon"] else "edible_food",
                        is_edible=c not in ["plate", "fork", "knife", "spoon", "garbage"],
                        confidence=conf_scores.get(c, 0.85),
                        pixel_area=int(item["food_px"] / max(1, len(item["classes"]))),
                        box_coords=json.dumps([120, 80, 520, 440])
                    )
                    db.add(obj)
            db.commit()

        # 6. Seed actionable recommendations based on initial database patterns
        recs_count = db.query(Recommendation).count()
        if recs_count == 0:
            recs_to_seed = [
                Recommendation(
                    title="Optimize Central Dining Rice Portion Sizing",
                    description="Rice consistently presents the highest aggregate leftover surface area (averaging 31.8% plate area) during Lunch sessions. Consider implementing a default standard ladle portion with free self-service top-ups.",
                    category="Cereals and Starches",
                    impact_priority="High",
                    supporting_metric="Observed in 62% of recorded Lunch scans with >25% leftover area",
                    cafeteria_id=cafeterias[0].id,
                    status="active"
                ),
                Recommendation(
                    title="Review Vegetable Side-Dish Prep Quantities on Thursdays",
                    description="Vegetable leftovers in Residence Hall Dining peaked by 18% compared to weekday averages. Recommend reviewing preparation quantities and testing seasonal roasted root preparations.",
                    category="Vegetables",
                    impact_priority="Medium",
                    supporting_metric="Leftover surface area reached 26.4% on Thursday dinner sessions",
                    cafeteria_id=cafeterias[2].id,
                    status="active"
                ),
                Recommendation(
                    title="Promote Half-Portion Option for Pasta Dishes",
                    description="Pasta dishes show high variation in leftover area between lunch and dinner. Introducing a half-portion option on the digital order board could reduce plate-waste area index by an estimated 12-15%.",
                    category="Cereals and Starches",
                    impact_priority="Medium",
                    supporting_metric="Average leftover pasta index 22.1% across 18 plate audits",
                    cafeteria_id=cafeterias[0].id,
                    status="active"
                )
            ]
            db.add_all(recs_to_seed)
            db.commit()

        # 7. Notifications
        notifs_count = db.query(Notification).count()
        if notifs_count == 0:
            notifs_to_seed = [
                Notification(
                    user_id=1,
                    title="YOLOv11 Instance Segmentation Active",
                    message="Model checkpoint models/best.pt loaded successfully across 85 PROJ3 food classes.",
                    type="success"
                ),
                Notification(
                    user_id=1,
                    title="SDG 12.3 Reporting Period Open",
                    message="Weekly cafeteria plate waste audit report is ready for generation and download.",
                    type="info"
                )
            ]
            db.add_all(notifs_to_seed)
            db.commit()

        print("Database initialized and seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
