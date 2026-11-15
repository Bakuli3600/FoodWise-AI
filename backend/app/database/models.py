from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Staff")  # Super Admin, Institution Admin, Cafeteria Manager, Staff, Researcher
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="users")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="institution")
    cafeterias = relationship("Cafeteria", back_populates="institution", cascade="all, delete-orphan")


class Cafeteria(Base):
    __tablename__ = "cafeterias"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    campus_location = Column(String(255), nullable=True)
    daily_capacity = Column(Integer, default=500)
    status = Column(String(50), default="active")  # active, maintenance, inactive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="cafeterias")
    meals = relationship("Meal", back_populates="cafeteria", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="cafeteria")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    cafeteria_id = Column(Integer, ForeignKey("cafeterias.id"), nullable=False)
    meal_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    meal_session = Column(String(50), nullable=False)  # Breakfast, Lunch, Evening Snacks, Dinner
    menu_items = Column(Text, nullable=True)  # JSON string of menu items
    plates_served = Column(Integer, default=0)
    plates_returned = Column(Integer, default=0)
    waste_weight_grams = Column(Float, nullable=True)  # Physical scale measurement (strictly separate from 2D pixel area index)
    notes = Column(Text, nullable=True)
    recorded_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    cafeteria = relationship("Cafeteria", back_populates="meals")


class InferenceLog(Base):
    """
    Preserves exact backward compatibility with existing SQLite inference_logs table
    while adding supplementary columns for rich web frontend experiences.
    """
    __tablename__ = "inference_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(String(50), nullable=False)
    image_filename = Column(String(255), nullable=False)
    detected_classes = Column(Text, nullable=False)       # JSON string list
    confidence_scores = Column(Text, nullable=False)      # JSON string dict
    categories = Column(Text, nullable=False)             # JSON string list
    waste_percentage = Column(Float, nullable=False)       # Research formula 2D leftover area %
    food_area = Column(Integer, nullable=False)           # Edible food pixels
    plate_area = Column(Integer, nullable=False)          # Plate boundary pixels
    garbage_area = Column(Integer, nullable=False)        # Non-edible / garbage pixels
    model_version = Column(String(100), default="YOLOv11-seg")
    notes = Column(Text, nullable=True)

    # Supplementary columns
    original_image_path = Column(String(500), nullable=True)
    annotated_image_path = Column(String(500), nullable=True)
    clustering_image_path = Column(String(500), nullable=True)
    usable_plate_area = Column(Integer, nullable=True)
    plate_detected = Column(Boolean, default=True)
    detection_status = Column(String(50), default="success")  # success, no_plate_detected, zero_usable_area
    cafeteria_id = Column(Integer, ForeignKey("cafeterias.id"), nullable=True)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=True)
    created_by = Column(String(255), nullable=True)

    objects = relationship("DetectionObject", back_populates="inference_log", cascade="all, delete-orphan")


class DetectionObject(Base):
    __tablename__ = "detection_objects"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, ForeignKey("inference_logs.id"), nullable=False)
    class_id = Column(Integer, nullable=False)
    class_name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    semantic_type = Column(String(50), nullable=False)  # edible_food, plate_or_utensil, garbage_or_waste, beverage
    is_edible = Column(Boolean, default=True)
    confidence = Column(Float, nullable=False)
    pixel_area = Column(Integer, nullable=False)
    box_coords = Column(Text, nullable=True)  # JSON [x1, y1, x2, y2]

    inference_log = relationship("InferenceLog", back_populates="objects")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Affected food category or operation
    impact_priority = Column(String(20), nullable=False, default="Medium")  # High, Medium, Low
    supporting_metric = Column(String(255), nullable=False)
    cafeteria_id = Column(Integer, ForeignKey("cafeterias.id"), nullable=True)
    status = Column(String(50), default="active")  # active, accepted, dismissed, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    cafeteria = relationship("Cafeteria", back_populates="recommendations")


class PredictionRun(Base):
    __tablename__ = "prediction_runs"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)  # Random Forest, Ridge, Gradient Boosting
    horizon_days = Column(Integer, nullable=False, default=7)  # 7, 14, 30
    target_metric = Column(String(100), default="Average Waste Area Index")
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2 = Column(Float, nullable=True)
    predictions_json = Column(Text, nullable=False)  # Array of {date, predicted_waste, lower_bound, upper_bound}
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False)  # Daily, Weekly, Monthly Sustainability, Category Analysis
    date_range_start = Column(String(20), nullable=False)
    date_range_end = Column(String(20), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_format = Column(String(20), default="PDF")  # PDF, CSV
    generated_by = Column(String(255), default="System")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # warning, info, alert, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")
