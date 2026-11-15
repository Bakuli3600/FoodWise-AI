from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import Cafeteria, Institution
from backend.app.schemas.schemas import CafeteriaCreate, CafeteriaUpdate, CafeteriaResponse

router = APIRouter(prefix="/cafeterias", tags=["Cafeteria Management"])

@router.get("", response_model=List[CafeteriaResponse])
def list_cafeterias(db: Session = Depends(get_db)):
    return db.query(Cafeteria).all()

@router.get("/{caf_id}", response_model=CafeteriaResponse)
def get_cafeteria(caf_id: int, db: Session = Depends(get_db)):
    caf = db.query(Cafeteria).filter(Cafeteria.id == caf_id).first()
    if not caf:
        raise HTTPException(status_code=404, detail="Cafeteria not found.")
    return caf

@router.post("", response_model=CafeteriaResponse, status_code=status.HTTP_201_CREATED)
def create_cafeteria(data: CafeteriaCreate, db: Session = Depends(get_db)):
    existing = db.query(Cafeteria).filter(Cafeteria.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="A cafeteria with this code already exists.")
    
    first_inst = db.query(Institution).first()
    inst_id = first_inst.id if first_inst else None

    caf = Cafeteria(
        institution_id=inst_id,
        name=data.name,
        code=data.code.upper(),
        campus_location=data.campus_location,
        daily_capacity=data.daily_capacity,
        status="active"
    )
    db.add(caf)
    db.commit()
    db.refresh(caf)
    return caf

@router.patch("/{caf_id}", response_model=CafeteriaResponse)
def update_cafeteria(caf_id: int, data: CafeteriaUpdate, db: Session = Depends(get_db)):
    caf = db.query(Cafeteria).filter(Cafeteria.id == caf_id).first()
    if not caf:
        raise HTTPException(status_code=404, detail="Cafeteria not found.")
    
    if data.name is not None:
        caf.name = data.name
    if data.campus_location is not None:
        caf.campus_location = data.campus_location
    if data.daily_capacity is not None:
        caf.daily_capacity = data.daily_capacity
    if data.status is not None:
        caf.status = data.status

    db.commit()
    db.refresh(caf)
    return caf

@router.delete("/{caf_id}")
def delete_cafeteria(caf_id: int, db: Session = Depends(get_db)):
    caf = db.query(Cafeteria).filter(Cafeteria.id == caf_id).first()
    if not caf:
        raise HTTPException(status_code=404, detail="Cafeteria not found.")
    db.delete(caf)
    db.commit()
    return {"message": f"Cafeteria '{caf.name}' successfully deleted."}
