from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

class Settings:
    PROJECT_NAME: str = "FOODWISE AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "foodwise-ai-secret-key-super-secure-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{PROJECT_ROOT}/data/foodwise.db")
    
    # Paths
    STATIC_DIR: Path = PROJECT_ROOT / "backend" / "static"
    UPLOADS_DIR: Path = STATIC_DIR / "uploads"
    ANNOTATED_DIR: Path = STATIC_DIR / "annotated"
    REPORTS_DIR: Path = STATIC_DIR / "reports"
    SAMPLE_DIR: Path = PROJECT_ROOT / "data" / "sample_plates"
    
    # AI Models
    YOLO_WEIGHTS_PATH: Path = PROJECT_ROOT / "models" / "best.pt"
    FALLBACK_WEIGHTS_PATH: Path = PROJECT_ROOT / "yolo11n-seg.pt"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8501",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()

# Ensure directories exist
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.ANNOTATED_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
