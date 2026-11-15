import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_DB_PATH = os.path.join(BACKEND_DIR, "smartats.db").replace("\\", "/")
DEFAULT_UPLOAD_DIR = os.path.join(BACKEND_DIR, "data", "resumes")


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartATS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartats-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ENVIRONMENT: str = "development"

    # Default Recruiter Credentials (for development / initial bootstrap)
    DEFAULT_RECRUITER_EMAIL: str = "recruiter@smartats.com"
    DEFAULT_RECRUITER_PASSWORD: str = "recruiter123"

    # Database
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"

    # File Uploads
    UPLOAD_DIR: str = DEFAULT_UPLOAD_DIR
    MAX_UPLOAD_SIZE_MB: int = 15

    # Matching Weights
    WEIGHT_KEYWORD: float = 0.60
    WEIGHT_TFIDF: float = 0.40

    # OCR Settings
    TESSERACT_CMD: str = ""
    OCR_MIN_TEXT_LENGTH: int = 60

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        # If postgresql:// without driver, ensure compatible
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
