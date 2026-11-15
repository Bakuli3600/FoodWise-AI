from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("")
def list_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.id.desc()).all()

@router.patch("/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read."}

@router.post("/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read."}
