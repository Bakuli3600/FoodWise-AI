from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import InferenceLog
from backend.app.schemas.schemas import SustainabilityMetricsResponse

router = APIRouter(prefix="/sustainability", tags=["Sustainability & SDG Impact"])

@router.get("", response_model=SustainabilityMetricsResponse)
def get_sustainability_metrics(db: Session = Depends(get_db)):
    logs = db.query(InferenceLog).all()
    total_plates = len(logs)
    
    if total_plates == 0:
        return SustainabilityMetricsResponse(
            sdg_12_progress_percentage=0.0,
            target_12_3_benchmark="SDG 12.3: Halve food waste at institutional dining facilities by 2030",
            historical_reduction_rate=0.0,
            total_audited_plates=0,
            food_waste_index_baseline=30.0,
            food_waste_index_current=0.0,
            methodology_statement="Baseline calibration pending plate image audits.",
            scientific_disclaimer="Calculations strictly reflect 2D visible plate surface area."
        )

    baseline_waste = 32.5  # Institutional starting baseline
    current_avg = sum(l.waste_percentage for l in logs) / total_plates
    reduction_rate = ((baseline_waste - current_avg) / baseline_waste) * 100.0
    
    # Progress towards 50% reduction target (SDG 12.3)
    target_reduction = 50.0
    progress_pct = min(100.0, max(0.0, (reduction_rate / (target_reduction / 2)) * 100.0))

    return SustainabilityMetricsResponse(
        sdg_12_progress_percentage=round(progress_pct, 1),
        target_12_3_benchmark="SDG Target 12.3: 50% Reduction in consumer-stage plate leftovers by 2030",
        historical_reduction_rate=round(reduction_rate, 1),
        total_audited_plates=total_plates,
        food_waste_index_baseline=baseline_waste,
        food_waste_index_current=round(current_avg, 1),
        methodology_statement="Institutional plate waste is audited longitudinally using YOLOv11 instance segmentation surface area calculations: Waste Area (%) = FoodArea / (PlateArea - GarbageArea) * 100.",
        scientific_disclaimer="Scientific Notice: This index represents 2D visible surface area coverage. In accordance with Ferreira et al. (MDPI Applied Sciences 2025), physical food mass in grams and volumetric density are not directly inferred from single 2D photographs."
    )
