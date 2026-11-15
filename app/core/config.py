import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartATS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartats-secret-key-change-in-production"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./smartats.db"

    # File Uploads
    UPLOAD_DIR: str = os.path.abspath("./data/resumes")
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
