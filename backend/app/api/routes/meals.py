import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.models import Meal, Cafeteria
from backend.app.schemas.schemas import MealCreate, MealResponse

router = APIRouter(prefix="/meals", tags=["Meal & Service Management"])

@router.get("", response_model=List[MealResponse])
def list_meals(
    cafeteria_id: Optional[int] = Query(None),
    meal_date: Optional[str] = Query(None),
    session: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Meal)
    if cafeteria_id:
        query = query.filter(Meal.cafeteria_id == cafeteria_id)
    if meal_date:
        query = query.filter(Meal.meal_date == meal_date)
    if session:
        query = query.filter(Meal.meal_session == session)

    meals = query.order_by(Meal.meal_date.desc(), Meal.id.desc()).limit(limit).all()
    results = []
    for m in meals:
        try:
            items = json.loads(m.menu_items) if m.menu_items else []
        except Exception:
            items = []
        results.append(MealResponse(
            id=m.id,
            cafeteria_id=m.cafeteria_id,
            meal_date=m.meal_date,
            meal_session=m.meal_session,
            menu_items=items,
            plates_served=m.plates_served,
            plates_returned=m.plates_returned,
            waste_weight_grams=m.waste_weight_grams,
            notes=m.notes,
            recorded_by=m.recorded_by,
            created_at=m.created_at
        ))
    return results

@router.post("", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def record_meal(data: MealCreate, db: Session = Depends(get_db)):
    caf = db.query(Cafeteria).filter(Cafeteria.id == data.cafeteria_id).first()
    if not caf:
        raise HTTPException(status_code=404, detail="Associated cafeteria not found.")

    meal = Meal(
        cafeteria_id=data.cafeteria_id,
        meal_date=data.meal_date,
        meal_session=data.meal_session,
        menu_items=json.dumps(data.menu_items),
        plates_served=data.plates_served,
        plates_returned=data.plates_returned,
        waste_weight_grams=data.waste_weight_grams,
        notes=data.notes,
        recorded_by="Staff"
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    return MealResponse(
        id=meal.id,
        cafeteria_id=meal.cafeteria_id,
        meal_date=meal.meal_date,
        meal_session=meal.meal_session,
        menu_items=data.menu_items,
        plates_served=meal.plates_served,
        plates_returned=meal.plates_returned,
        waste_weight_grams=meal.waste_weight_grams,
        notes=meal.notes,
        recorded_by=meal.recorded_by,
        created_at=meal.created_at
    )
