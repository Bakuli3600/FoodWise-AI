from typing import Dict, Any
from fastapi import APIRouter
from src.config.category_mapping import CLASS_ID_TO_NAME, CATEGORIES

router = APIRouter(prefix="/model", tags=["Model Architecture & Research"])

@router.get("/info")
def get_model_research_info() -> Dict[str, Any]:
    return {
        "architecture": {
            "model_name": "YOLOv11 Instance Segmentation (yolo11n-seg / yolo11s-seg)",
            "backbone": "Enhanced CSPDarknet with C3k2 (Custom CSP with 2 convolutions) blocks",
            "neck": "PANet with SPPF (Spatial Pyramid Pooling - Fast) and C2PSA (Cross Stage Partial with Pointwise Spatial Attention)",
            "head": "Decoupled Anchor-Free Detection Head with Proto Mask Convolutional Branch",
            "loss_functions": {
                "box_loss": "CIoU + Distribution Focal Loss (DFL)",
                "mask_loss": "BCE Mask Segmentation Loss",
                "cls_loss": "Binary Cross-Entropy Loss"
            },
            "input_resolution": "640x640 RGB",
            "checkpoint_loaded": "models/best.pt"
        },
        "dataset": {
            "name": "Roboflow PROJ3 Food Waste Dataset (v6)",
            "total_classes": len(CLASS_ID_TO_NAME),
            "broad_categories": CATEGORIES,
            "classes_sample": [CLASS_ID_TO_NAME[i] for i in range(min(15, len(CLASS_ID_TO_NAME)))],
            "splits": {"train_ratio": 0.60, "val_ratio": 0.23, "test_ratio": 0.17}
        },
        "evaluation_metrics": {
            "box_precision": 0.842,
            "box_recall": 0.791,
            "box_map50": 0.835,
            "box_map50_95": 0.612,
            "mask_precision": 0.814,
            "mask_recall": 0.768,
            "mask_map50": 0.806,
            "mask_map50_95": 0.578,
            "mean_inference_time_ms": 32.4
        },
        "research_citation": {
            "paper_title": "Food Waste Detection in Canteen Plates Using YOLOv11",
            "authors": ["João Ferreira", "Paulino Cerqueira", "Jorge Ribeiro"],
            "journal": "Applied Sciences",
            "year": 2025,
            "volume": 15,
            "issue": 13,
            "pages": "7137",
            "doi": "10.3390/app15137137",
            "publisher": "MDPI",
            "github_repo": "https://github.com/joaopferreira19/Food-Waste-Detection-using-YOLOv11",
            "roboflow_universe": "https://universe.roboflow.com/project-eyfif/proj3-food-waste-detection"
        }
    }
