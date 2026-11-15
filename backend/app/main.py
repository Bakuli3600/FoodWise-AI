from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.database.init_db import seed_database
from backend.app.api.routes import (
    auth, detection, history, analytics, predictions,
    recommendations, cafeterias, meals, sustainability,
    assistant, model_info, notifications, reports
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure migrations and initial seeds
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Food Waste Detection and Categorization System Using YOLOv11 Instance Segmentation",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts
app.mount("/static/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="uploads")
app.mount("/static/annotated", StaticFiles(directory=str(settings.ANNOTATED_DIR)), name="annotated")
app.mount("/static/reports", StaticFiles(directory=str(settings.REPORTS_DIR)), name="reports")
if settings.SAMPLE_DIR.exists():
    app.mount("/static/samples", StaticFiles(directory=str(settings.SAMPLE_DIR)), name="samples")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(detection.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(cafeterias.router, prefix=settings.API_V1_STR)
app.include_router(meals.router, prefix=settings.API_V1_STR)
app.include_router(sustainability.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(model_info.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "yolo_checkpoint_loaded": settings.YOLO_WEIGHTS_PATH.exists()
    }
