import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import InferenceLog, DetectionObject, Cafeteria
from backend.app.schemas.schemas import HistoryItemResponse

router = APIRouter(prefix="/history", tags=["Detection History"])

@router.get("", response_model=List[HistoryItemResponse])
def get_detection_history(
    search: Optional[str] = Query(None, description="Search by class name or category"),
    cafeteria_id: Optional[int] = Query(None),
    min_waste: Optional[float] = Query(None),
    max_waste: Optional[float] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(InferenceLog)

    if cafeteria_id:
        query = query.filter(InferenceLog.cafeteria_id == cafeteria_id)
    if min_waste is not None:
        query = query.filter(InferenceLog.waste_percentage >= min_waste)
    if max_waste is not None:
        query = query.filter(InferenceLog.waste_percentage <= max_waste)
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            (InferenceLog.detected_classes.ilike(search_pattern)) |
            (InferenceLog.categories.ilike(search_pattern)) |
            (InferenceLog.notes.ilike(search_pattern))
        )

    records = query.order_by(InferenceLog.id.desc()).offset(offset).limit(limit).all()

    results = []
    for r in records:
        try:
            detected_classes = json.loads(r.detected_classes)
            confidence_scores = json.loads(r.confidence_scores)
            categories = json.loads(r.categories)
        except Exception:
            detected_classes, confidence_scores, categories = [], {}, []

        results.append(HistoryItemResponse(
            id=r.id,
            timestamp=r.timestamp,
            image_filename=r.image_filename,
            original_image_path=r.original_image_path or f"/static/uploads/{r.image_filename}",
            annotated_image_path=r.annotated_image_path or f"/static/annotated/annotated_{r.image_filename}",
            waste_percentage=r.waste_percentage,
            food_area=r.food_area,
            plate_area=r.plate_area,
            garbage_area=r.garbage_area,
            detected_classes=detected_classes,
            confidence_scores=confidence_scores,
            categories=categories,
            model_version=r.model_version,
            plate_detected=bool(r.plate_detected),
            detection_status=r.detection_status or "success",
            cafeteria_id=r.cafeteria_id,
            created_by=r.created_by,
            notes=r.notes
        ))
    return results

@router.get("/{record_id}", response_model=HistoryItemResponse)
def get_history_detail(record_id: int, db: Session = Depends(get_db)):
    r = db.query(InferenceLog).filter(InferenceLog.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Detection record not found.")

    try:
        detected_classes = json.loads(r.detected_classes)
        confidence_scores = json.loads(r.confidence_scores)
        categories = json.loads(r.categories)
    except Exception:
        detected_classes, confidence_scores, categories = [], {}, []

    return HistoryItemResponse(
        id=r.id,
        timestamp=r.timestamp,
        image_filename=r.image_filename,
        original_image_path=r.original_image_path or f"/static/uploads/{r.image_filename}",
        annotated_image_path=r.annotated_image_path or f"/static/annotated/annotated_{r.image_filename}",
        waste_percentage=r.waste_percentage,
        food_area=r.food_area,
        plate_area=r.plate_area,
        garbage_area=r.garbage_area,
        detected_classes=detected_classes,
        confidence_scores=confidence_scores,
        categories=categories,
        model_version=r.model_version,
        plate_detected=bool(r.plate_detected),
        detection_status=r.detection_status or "success",
        cafeteria_id=r.cafeteria_id,
        created_by=r.created_by,
        notes=r.notes
    )

@router.delete("/{record_id}")
def delete_detection_record(record_id: int, db: Session = Depends(get_db)):
    r = db.query(InferenceLog).filter(InferenceLog.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Detection record not found.")
    
    # Delete associated detection objects
    db.query(DetectionObject).filter(DetectionObject.detection_id == record_id).delete()
    db.delete(r)
    db.commit()
    return {"message": f"Detection record #{record_id} successfully deleted."}
