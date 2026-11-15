from datetime import datetime
from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field

# ----------------- Auth Schemas -----------------
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    role: str = "Staff"  # Super Admin, Institution Admin, Cafeteria Manager, Staff, Researcher
    institution_id: Optional[int] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    institution_id: Optional[int] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Detection Schemas -----------------
class ObjectDetectionItem(BaseModel):
    class_id: int
    class_name: str
    category: str
    semantic_type: str
    is_edible: bool
    confidence: float
    pixel_area: int
    box: Optional[List[float]] = None

class WasteAnalysisResponse(BaseModel):
    waste_percentage: float
    food_area: int
    plate_area: int
    garbage_area: int
    usable_plate_area: int
    plate_detected: bool
    status: str
    message: str
    metric_name: str

class DetectionResponse(BaseModel):
    id: Optional[int] = None
    timestamp: str
    image_filename: str
    original_image_url: str
    annotated_image_url: str
    clustering_image_url: str
    waste_percentage: float
    waste_analysis: WasteAnalysisResponse
    detected_objects: List[ObjectDetectionItem]
    edible_items_count: int
    has_reliable_detections: bool
    message: str
    model_version: str = "YOLOv11-seg"
    table_rows: List[Dict[str, Any]]
    image_dimensions: Optional[List[int]] = None
    cafeteria_id: Optional[int] = None

class SampleImageItem(BaseModel):
    filename: str
    title: str
    image_url: str
    description: Optional[str] = None

# ----------------- History Schemas -----------------
class HistoryItemResponse(BaseModel):
    id: int
    timestamp: str
    image_filename: str
    original_image_path: Optional[str] = None
    annotated_image_path: Optional[str] = None
    waste_percentage: float
    food_area: int
    plate_area: int
    garbage_area: int
    detected_classes: List[str]
    confidence_scores: Dict[str, float]
    categories: List[str]
    model_version: str
    plate_detected: bool
    detection_status: str
    cafeteria_id: Optional[int] = None
    created_by: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Analytics Schemas -----------------
class AnalyticsOverviewResponse(BaseModel):
    total_plates_analyzed: int
    average_waste_percentage: float
    total_detection_sessions: int
    most_frequently_wasted_food: str
    average_daily_waste_index: float
    waste_reduction_trend: float
    total_food_pixels: int

class CategoryIntelligenceItem(BaseModel):
    category: str
    detection_count: int
    average_waste_percentage: float
    percentage_of_total_detections: float
    color_hex: str

class TrendItem(BaseModel):
    date: str
    average_waste_percentage: float
    scans_count: int

class CafeteriaComparisonItem(BaseModel):
    cafeteria_name: str
    cafeteria_code: str
    total_scans: int
    average_waste_percentage: float
    plates_served: int
    plates_returned: int

class InsightItem(BaseModel):
    title: str
    insight_text: str
    category: str
    type: str  # observed, derived, prediction
    confidence_level: str  # high, medium, provisional
    supporting_evidence: str

# ----------------- Prediction Schemas -----------------
class ForecastPoint(BaseModel):
    date: str
    predicted_waste: float
    lower_bound: float
    upper_bound: float

class PredictionResponse(BaseModel):
    model_name: str
    horizon_days: int
    forecast_points: List[ForecastPoint]
    historical_points: List[Dict[str, Any]]
    evaluation_metrics: Dict[str, Optional[float]]  # mae, rmse, r2
    last_trained_date: str
    is_demo: bool
    status_message: str

# ----------------- Recommendation Schemas -----------------
class RecommendationResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    impact_priority: str
    supporting_metric: str
    cafeteria_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecommendationStatusUpdate(BaseModel):
    status: str  # active, accepted, dismissed, completed

# ----------------- Cafeteria & Meal Schemas -----------------
class CafeteriaCreate(BaseModel):
    name: str
    code: str
    campus_location: Optional[str] = None
    daily_capacity: int = 500

class CafeteriaUpdate(BaseModel):
    name: Optional[str] = None
    campus_location: Optional[str] = None
    daily_capacity: Optional[int] = None
    status: Optional[str] = None

class CafeteriaResponse(BaseModel):
    id: int
    name: str
    code: str
    campus_location: Optional[str] = None
    daily_capacity: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MealCreate(BaseModel):
    cafeteria_id: int
    meal_date: str
    meal_session: str
    menu_items: List[str]
    plates_served: int
    plates_returned: int
    waste_weight_grams: Optional[float] = None
    notes: Optional[str] = None

class MealResponse(BaseModel):
    id: int
    cafeteria_id: int
    meal_date: str
    meal_session: str
    menu_items: List[str]
    plates_served: int
    plates_returned: int
    waste_weight_grams: Optional[float] = None
    notes: Optional[str] = None
    recorded_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Sustainability Schemas -----------------
class SustainabilityMetricsResponse(BaseModel):
    sdg_12_progress_percentage: float
    target_12_3_benchmark: str
    historical_reduction_rate: float
    total_audited_plates: int
    food_waste_index_baseline: float
    food_waste_index_current: float
    methodology_statement: str
    scientific_disclaimer: str

# ----------------- Report Schemas -----------------
class ReportGenerateRequest(BaseModel):
    title: str
    report_type: str  # Daily, Weekly Cafeteria, Monthly Sustainability, Category Analysis
    date_range_start: str
    date_range_end: str
    cafeteria_id: Optional[int] = None
    format: str = "PDF"  # PDF, CSV

class ReportItemResponse(BaseModel):
    id: int
    title: str
    report_type: str
    date_range_start: str
    date_range_end: str
    file_path: str
    file_format: str
    generated_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Assistant Schemas -----------------
class AssistantQueryRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class AssistantQueryResponse(BaseModel):
    answer: str
    data_sources: List[str]
    suggested_followups: List[str]
