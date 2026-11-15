import base64
import io
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from PIL import Image

from backend.app.core.config import settings
from backend.app.database.database import get_db
from backend.app.database.models import InferenceLog, DetectionObject, Cafeteria
from backend.app.schemas.schemas import DetectionResponse, SampleImageItem, WasteAnalysisResponse, ObjectDetectionItem
from src.inference.predictor import FoodWisePredictor

router = APIRouter(prefix="/detection", tags=["AI Food Waste Detection"])

# Shared predictor singleton
_cached_predictor: Optional[FoodWisePredictor] = None

def get_yolo_predictor() -> FoodWisePredictor:
    global _cached_predictor
    if _cached_predictor is None:
        weights = str(settings.YOLO_WEIGHTS_PATH) if settings.YOLO_WEIGHTS_PATH.exists() else None
        _cached_predictor = FoodWisePredictor(weights_path=weights, conf_threshold=0.12)
    return _cached_predictor

SAMPLE_TITLES = {
    "15_img_jpeg.rf.385bc52d42e5652cd9c9fb7f668fbf01.jpg": (
        "Grilled Chicken Steak & French Fries",
        "Returned cafeteria plate with grilled poultry steak, golden french fries, and rice remnants."
    ),
    "0_jpeg.rf.4df05c06a5f5a02fe62591ef39399697.jpg": (
        "Steamed Rice & Roast Chicken Breast",
        "Benchmark dining plate with leftover steamed white rice portion and roast chicken."
    ),
    "17_jpeg.rf.ae3af5b295cc50386681a6f0b72d2ecf.jpg": (
        "Breaded Chicken Cutlet & Rice",
        "Uneaten rice portion and breaded chicken cutlet with fork."
    ),
    "1_jpg.rf.02a1c63fbc877eeb8f9c7c88bd6b359f.jpg": (
        "Steak & Steamed Rice Meal",
        "Canteen meal plate containing braised steak and seasoned rice."
    ),
    "29_img_jpeg.rf.b8299c407ee776a2ec51e6b283fa7bfe.jpg": (
        "Fried Sunny Egg & Toasted Bread",
        "Breakfast dining tray with sunny egg and toasted bread slice."
    ),
    "11_jpeg.rf.f67b20c68ea0bfa9ebefe61a6d359822.jpg": (
        "Canteen Cutlet, Rice & Fresh Greens",
        "Complete lunch dish with cutlet, carbohydrate portion, and greens."
    ),
    "27_img_jpeg.rf.fb6dc98957cf9d5eb5fd06ecfd1c2780.jpg": (
        "Garden Tomatoes, Fried Egg & Salad",
        "Salad bar return with sliced tomatoes, egg, and vegetable garnish."
    ),
    "70_img_jpeg.rf.58120e9fda9657bacce3d7764ca91285.jpg": (
        "Roast Chicken Cutlet & Rice",
        "High-protein plate with roasted poultry breast and steamed grains."
    )
}

@router.get("/samples", response_model=List[SampleImageItem])
def get_sample_images():
    """Lists available test plate images from PROJ3 dataset for one-click testing."""
    sample_files = list(settings.SAMPLE_DIR.glob("*.jpg")) + list(settings.SAMPLE_DIR.glob("*.png"))
    items = []
    # Prioritize our curated benchmark samples
    priority_order = list(SAMPLE_TITLES.keys())
    sorted_files = sorted(
        sample_files,
        key=lambda f: priority_order.index(f.name) if f.name in priority_order else 999
    )
    for f in sorted_files[:8]:
        meta = SAMPLE_TITLES.get(f.name, (
            f"PROJ3 Canteen Plate ({f.stem[-8:]})",
            "Official benchmark plate photograph from Ferreira et al. dataset."
        ))
        items.append(SampleImageItem(
            filename=f.name,
            title=meta[0],
            image_url=f"/static/samples/{f.name}",
            description=meta[1]
        ))
    return items

@router.post("/predict", response_model=DetectionResponse)
async def predict_food_waste(
    file: Optional[UploadFile] = File(None),
    sample_filename: Optional[str] = Form(None),
    webcam_base64: Optional[str] = Form(None),
    cafeteria_id: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    conf_threshold: Optional[float] = Form(0.12),
    db: Session = Depends(get_db)
):
    """
    Core AI Detection Endpoint:
    Processes input plate images through YOLOv11 segmentation, category grouping,
    and exact 2D Food Waste Area Index calculation with safeguards.
    """
    predictor = get_yolo_predictor()

    # Determine image source
    if file:
        contents = await file.read()
        try:
            pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file uploaded.")
        orig_filename = f"{uuid.uuid4().hex[:12]}_{file.filename}"
    elif sample_filename:
        sample_path = settings.SAMPLE_DIR / sample_filename
        if not sample_path.exists():
            raise HTTPException(status_code=404, detail="Sample image not found on server.")
        pil_image = Image.open(sample_path).convert("RGB")
        orig_filename = f"{uuid.uuid4().hex[:12]}_{sample_filename}"
    elif webcam_base64:
        try:
            if "," in webcam_base64:
                header, encoded = webcam_base64.split(",", 1)
            else:
                encoded = webcam_base64
            img_bytes = base64.b64decode(encoded)
            pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            orig_filename = f"webcam_{uuid.uuid4().hex[:12]}.jpg"
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 camera image data.")
    else:
        raise HTTPException(status_code=400, detail="No image provided. Please upload an image, select a sample, or capture via webcam.")

    # Save original image
    orig_path = settings.UPLOADS_DIR / orig_filename
    pil_image.save(orig_path, "JPEG", quality=92)

    # Execute YOLOv11 segmentation and waste analysis with sensitivity threshold
    inference_result = predictor.predict(pil_image, conf_threshold=conf_threshold)

    # Save annotated and clustering visualization images
    annotated_filename = f"annotated_{orig_filename}"
    annotated_path = settings.ANNOTATED_DIR / annotated_filename
    inference_result["annotated_image"].save(annotated_path, "JPEG", quality=90)

    clustering_filename = f"clustering_{orig_filename}"
    clustering_path = settings.ANNOTATED_DIR / clustering_filename
    inference_result["clustering_image"].save(clustering_path, "JPEG", quality=90)

    waste_info = inference_result["waste_analysis"]
    detected_objs = inference_result["detected_objects"]

    # Extract lists for database storage
    detected_classes = [obj["class_name"] for obj in detected_objs]
    categories_list = list(set(obj["category"] for obj in detected_objs))
    conf_dict = {obj["class_name"]: obj["confidence"] for obj in detected_objs}

    # Associate cafeteria
    if not cafeteria_id:
        first_caf = db.query(Cafeteria).first()
        cafeteria_id = first_caf.id if first_caf else None

    # Persist in database
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_record = InferenceLog(
        timestamp=now_str,
        image_filename=orig_filename,
        detected_classes=json.dumps(detected_classes),
        confidence_scores=json.dumps(conf_dict),
        categories=json.dumps(categories_list),
        waste_percentage=waste_info["waste_percentage"],
        food_area=waste_info["food_area"],
        plate_area=waste_info["plate_area"],
        garbage_area=waste_info["garbage_area"],
        usable_plate_area=waste_info["usable_plate_area"],
        plate_detected=waste_info["plate_detected"],
        detection_status=waste_info["status"],
        model_version="YOLOv11-seg (best.pt)",
        notes=notes,
        original_image_path=f"/static/uploads/{orig_filename}",
        annotated_image_path=f"/static/annotated/{annotated_filename}",
        clustering_image_path=f"/static/annotated/{clustering_filename}",
        cafeteria_id=cafeteria_id,
        created_by="Staff"
    )
    db.add(log_record)
    db.flush()

    # Save detailed objects
    for obj in detected_objs:
        db_obj = DetectionObject(
            detection_id=log_record.id,
            class_id=obj["class_id"],
            class_name=obj["class_name"],
            category=obj["category"],
            semantic_type=obj["semantic_type"],
            is_edible=obj["is_edible"],
            confidence=obj["confidence"],
            pixel_area=obj["area"],
            box_coords=json.dumps(obj.get("box", []))
        )
        db.add(db_obj)
    db.commit()
    db.refresh(log_record)

    # Format response
    obj_items = [
        ObjectDetectionItem(
            class_id=o["class_id"],
            class_name=o["class_name"],
            category=o["category"],
            semantic_type=o["semantic_type"],
            is_edible=o["is_edible"],
            confidence=o["confidence"],
            pixel_area=o["area"],
            box=o.get("box")
        )
        for o in detected_objs
    ]

    return DetectionResponse(
        id=log_record.id,
        timestamp=now_str,
        image_filename=orig_filename,
        original_image_url=f"/static/uploads/{orig_filename}",
        annotated_image_url=f"/static/annotated/{annotated_filename}",
        clustering_image_url=f"/static/annotated/{clustering_filename}",
        waste_percentage=waste_info["waste_percentage"],
        waste_analysis=WasteAnalysisResponse(**waste_info),
        detected_objects=obj_items,
        edible_items_count=len(inference_result["edible_items"]),
        has_reliable_detections=inference_result["has_reliable_detections"],
        message=inference_result["message"],
        model_version="YOLOv11-seg (best.pt)",
        table_rows=inference_result["table_rows"],
        image_dimensions=list(inference_result["image_dimensions"]),
        cafeteria_id=cafeteria_id
    )
