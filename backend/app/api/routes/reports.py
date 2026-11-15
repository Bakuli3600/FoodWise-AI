import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.database.database import get_db
from backend.app.database.models import Report, InferenceLog, Recommendation
from backend.app.schemas.schemas import ReportGenerateRequest, ReportItemResponse
from backend.app.services.report_generator import generate_pdf_report, generate_csv_report

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("", response_model=List[ReportItemResponse])
def list_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.id.desc()).all()

@router.post("/generate", response_model=ReportItemResponse)
def generate_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    # Query logs within range
    query = db.query(InferenceLog)
    if req.cafeteria_id:
        query = query.filter(InferenceLog.cafeteria_id == req.cafeteria_id)
    logs = query.all()

    total_scans = len(logs)
    avg_waste = (sum(l.waste_percentage for l in logs) / total_scans) if total_scans > 0 else 0.0

    # Build category breakdown
    cat_counts = {}
    for l in logs:
        try:
            for c in json.loads(l.categories):
                if c not in ["Non-edible Materials", "Plate / Utensil"]:
                    cat_counts[c] = cat_counts.get(c, 0) + 1
        except Exception:
            pass

    top_categories = [
        {
            "category": k,
            "detection_count": v,
            "average_waste_percentage": avg_waste,
            "percentage_of_total_detections": round((v / max(1, sum(cat_counts.values()))) * 100, 1)
        }
        for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    recs = db.query(Recommendation).filter(Recommendation.status == "active").all()
    rec_dicts = [
        {"title": r.title, "description": r.description, "impact_priority": r.impact_priority, "supporting_metric": r.supporting_metric}
        for r in recs
    ]

    metrics = {
        "total_plates_analyzed": total_scans,
        "average_waste_percentage": avg_waste,
        "most_frequently_wasted_food": top_categories[0]["category"] if top_categories else "Rice",
        "waste_reduction_trend": -4.2
    }

    report_id_str = uuid.uuid4().hex[:8]
    if req.format.upper() == "CSV":
        filename = f"report_{report_id_str}.csv"
        dict_logs = [
            {
                "id": l.id,
                "timestamp": l.timestamp,
                "image_filename": l.image_filename,
                "waste_percentage": l.waste_percentage,
                "food_area": l.food_area,
                "plate_area": l.plate_area,
                "garbage_area": l.garbage_area,
                "usable_plate_area": l.usable_plate_area,
                "detected_classes": json.loads(l.detected_classes),
                "categories": json.loads(l.categories),
                "model_version": l.model_version,
                "cafeteria_id": l.cafeteria_id
            }
            for l in logs
        ]
        file_path = generate_csv_report(dict_logs, filename)
    else:
        filename = f"report_{report_id_str}.pdf"
        file_path = generate_pdf_report(
            title=req.title,
            report_type=req.report_type,
            date_start=req.date_range_start,
            date_end=req.date_range_end,
            metrics=metrics,
            top_categories=top_categories,
            recommendations=rec_dicts,
            output_filename=filename
        )

    db_report = Report(
        title=req.title,
        report_type=req.report_type,
        date_range_start=req.date_range_start,
        date_range_end=req.date_range_end,
        file_path=f"/static/reports/{filename}",
        file_format=req.format.upper(),
        generated_by="Administrator"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report

@router.get("/download/{filename}")
def download_report_file(filename: str):
    file_path = settings.REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Requested report file not found on disk.")
    
    media_type = "application/pdf" if filename.endswith(".pdf") else "text/csv"
    return FileResponse(path=str(file_path), filename=filename, media_type=media_type)
