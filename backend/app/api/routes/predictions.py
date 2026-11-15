from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import InferenceLog
from backend.app.schemas.schemas import PredictionResponse, ForecastPoint
from backend.app.ml.prediction.predict import run_waste_forecast

router = APIRouter(prefix="/predictions", tags=["Waste Predictions"])

@router.get("", response_model=PredictionResponse)
def get_waste_predictions(
    horizon: int = Query(7, ge=7, le=30),
    allow_demo: bool = Query(True),
    cafeteria_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(InferenceLog)
    if cafeteria_id:
        query = query.filter(InferenceLog.cafeteria_id == cafeteria_id)
    
    logs = query.all()
    dict_logs = [
        {
            "timestamp": l.timestamp,
            "waste_percentage": l.waste_percentage,
            "food_area": l.food_area,
            "plate_area": l.plate_area
        }
        for l in logs
    ]

    res = run_waste_forecast(dict_logs, horizon_days=horizon, allow_demo=allow_demo)

    forecast_pts = [ForecastPoint(**pt) for pt in res["forecast_points"]]

    return PredictionResponse(
        model_name=res["model_name"],
        horizon_days=res["horizon_days"],
        forecast_points=forecast_pts,
        historical_points=res["historical_points"],
        evaluation_metrics=res["evaluation_metrics"],
        last_trained_date=res["last_trained_date"],
        is_demo=res["is_demo"],
        status_message=res["status_message"]
    )
