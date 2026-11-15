import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.database.models import InferenceLog, Recommendation, Cafeteria

def generate_data_driven_recommendations(db: Session, cafeteria_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Evaluates real database detection records against statistical thresholds
    and outputs evidence-backed recommendations for portion sizing, preparation quantities,
    and menu scheduling.
    """
    query = db.query(InferenceLog)
    if cafeteria_id:
        query = query.filter(InferenceLog.cafeteria_id == cafeteria_id)
    
    logs = query.all()
    if not logs:
        return []

    # 1. Frequency and waste analysis per class and category
    category_waste_sum: Dict[str, float] = {}
    category_counts: Dict[str, int] = {}
    class_counts: Dict[str, int] = {}

    total_scans = len(logs)
    avg_waste_overall = sum(l.waste_percentage for l in logs) / max(1, total_scans)

    for l in logs:
        try:
            cats = json.loads(l.categories)
            cls_list = json.loads(l.detected_classes)
        except Exception:
            continue

        for cat in cats:
            if cat not in ["Non-edible Materials", "Plate / Utensil"]:
                category_waste_sum[cat] = category_waste_sum.get(cat, 0.0) + l.waste_percentage
                category_counts[cat] = category_counts.get(cat, 0) + 1

        for c in cls_list:
            if c not in ["plate", "fork", "knife", "spoon", "garbage"]:
                class_counts[c] = class_counts.get(c, 0) + 1

    generated_recommendations = []

    # Rule 1: High Starch / Cereals leftover area
    starchy_count = category_counts.get("Cereals and Starches", 0)
    if starchy_count >= 3:
        avg_starch_waste = category_waste_sum["Cereals and Starches"] / starchy_count
        if avg_starch_waste > 25.0:
            top_starchy = "rice" if class_counts.get("rice", 0) >= class_counts.get("pasta", 0) else "pasta"
            generated_recommendations.append({
                "title": f"Adjust {top_starchy.title()} Standard Ladle Portion Size",
                "description": f"{top_starchy.title()} and associated starches account for an average leftover plate area of {avg_starch_waste:.1f}%. Introducing a measured baseline portion alongside self-service refills can reduce post-consumer waste.",
                "category": "Cereals and Starches",
                "impact_priority": "High" if avg_starch_waste > 30.0 else "Medium",
                "supporting_metric": f"Observed in {starchy_count} scans with {avg_starch_waste:.1f}% mean leftover area (Institutional avg: {avg_waste_overall:.1f}%)"
            })

    # Rule 2: Vegetables leftover area
    veg_count = category_counts.get("Vegetables", 0)
    if veg_count >= 2:
        avg_veg_waste = category_waste_sum["Vegetables"] / veg_count
        if avg_veg_waste > 20.0:
            generated_recommendations.append({
                "title": "Review Vegetable Preparation & Recipe Variations",
                "description": f"Vegetable side dishes demonstrated a {avg_veg_waste:.1f}% average leftover area. Consider surveying diner feedback on preparation methods (e.g. roasted vs steamed) to improve consumption rates.",
                "category": "Vegetables",
                "impact_priority": "Medium",
                "supporting_metric": f"Recorded across {veg_count} audited meals with {avg_veg_waste:.1f}% leftover index"
            })

    # Rule 3: High overall average waste index alert
    if avg_waste_overall > 28.0:
        generated_recommendations.append({
            "title": "Conduct Plate Scraping Audit for Lunch Meal Sessions",
            "description": f"The overall institutional plate waste index is currently elevated at {avg_waste_overall:.1f}%. Reviewing tray return station congestion and batch preparation timing can prevent excessive over-portioning.",
            "category": "Dining Operations",
            "impact_priority": "High",
            "supporting_metric": f"Cross-cafeteria average waste area index {avg_waste_overall:.1f}% exceeds 25.0% threshold"
        })

    # Rule 4: Protein / Meat leftover monitoring
    protein_count = category_counts.get("Protein and Meat", 0)
    if protein_count >= 3:
        avg_protein_waste = category_waste_sum["Protein and Meat"] / protein_count
        if avg_protein_waste > 22.0:
            generated_recommendations.append({
                "title": "Evaluate Protein Course Portioning Standards",
                "description": f"Protein items (chicken, fish, meats) recorded an average leftover plate area of {avg_protein_waste:.1f}%. Consider portion-cutting consistency in central kitchen prep.",
                "category": "Protein and Meat",
                "impact_priority": "Medium",
                "supporting_metric": f"Observed across {protein_count} plate scans with {avg_protein_waste:.1f}% leftover index"
            })

    return generated_recommendations
