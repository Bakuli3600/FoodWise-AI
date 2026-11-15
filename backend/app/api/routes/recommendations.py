from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import Recommendation
from backend.app.schemas.schemas import RecommendationResponse, RecommendationStatusUpdate
from backend.app.ml.recommendation.engine import generate_data_driven_recommendations

router = APIRouter(prefix="/recommendations", tags=["Smart Recommendation Engine"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    status: Optional[str] = Query(None),
    cafeteria_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Recommendation)
    if status:
        query = query.filter(Recommendation.status == status)
    if cafeteria_id:
        query = query.filter(Recommendation.cafeteria_id == cafeteria_id)

    recs = query.order_by(Recommendation.id.desc()).all()
    return recs

@router.post("/re-evaluate", response_model=List[RecommendationResponse])
def reevaluate_recommendations(
    cafeteria_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Triggers analytical audit across plate logs to generate fresh interventions."""
    new_recs = generate_data_driven_recommendations(db, cafeteria_id=cafeteria_id)
    added = []
    for r_data in new_recs:
        # Check if identical title already exists
        exists = db.query(Recommendation).filter(Recommendation.title == r_data["title"]).first()
        if not exists:
            rec = Recommendation(
                title=r_data["title"],
                description=r_data["description"],
                category=r_data["category"],
                impact_priority=r_data["impact_priority"],
                supporting_metric=r_data["supporting_metric"],
                cafeteria_id=cafeteria_id,
                status="active"
            )
            db.add(rec)
            added.append(rec)
    db.commit()
    return db.query(Recommendation).order_by(Recommendation.id.desc()).all()

@router.patch("/{rec_id}/status", response_model=RecommendationResponse)
def update_recommendation_status(
    rec_id: int,
    status_update: RecommendationStatusUpdate,
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
    
    rec.status = status_update.status
    db.commit()
    db.refresh(rec)
    return rec
