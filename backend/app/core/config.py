import os
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_DB_PATH = os.path.join(BACKEND_DIR, "smartats.db").replace("\\", "/")
DEFAULT_UPLOAD_DIR = os.path.join(BACKEND_DIR, "data", "resumes")


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartATS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartats-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "development"

    # Default Recruiter Credentials (for development / initial bootstrap)
    DEFAULT_RECRUITER_EMAIL: str = "recruiter@smartats.com"
    DEFAULT_RECRUITER_PASSWORD: str = "recruiter123"

    # Database
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"

    # File Uploads
    UPLOAD_DIR: str = DEFAULT_UPLOAD_DIR
    MAX_UPLOAD_SIZE_MB: int = 15
    MAX_FILES_PER_REQUEST: int = 25
    MAX_REQUEST_SIZE_MB: int = 100
    RATE_LIMIT_STORAGE_URI: str = "memory://"

    # Matching Weights
    WEIGHT_KEYWORD: float = 0.60
    WEIGHT_TFIDF: float = 0.40

    # OCR Settings
    TESSERACT_CMD: str = ""
    OCR_MIN_TEXT_LENGTH: int = 60

    # CORS Allowed Origins (No wildcard '*' by default with credentials)
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_strip = v.strip()
            if v_strip.startswith("[") and v_strip.endswith("]"):
                import json
                try:
                    parsed = json.loads(v_strip)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [origin.strip() for origin in v_strip.split(",") if origin.strip()]
        if isinstance(v, (list, tuple)):
            return [str(origin).strip() for origin in v if str(origin).strip()]
        return []

    @model_validator(mode="after")
    def validate_production_configuration(self):
        is_prod = str(self.ENVIRONMENT).strip().lower() in ("production", "prod")
        insecure_keys = {
            "smartats-secret-key-change-in-production",
            "secret",
            "changeme",
            "default",
            "admin",
            "password",
            ""
        }
        insecure_passwords = {
            "recruiter123",
            "password",
            "admin",
            "admin123",
            "12345678",
            "123456",
            "secret",
            "changeme",
            "root",
            "smartats",
            ""
        }
        if is_prod:
            normalized_key = self.SECRET_KEY.strip().lower()
            if (
                not normalized_key
                or normalized_key in insecure_keys
                or normalized_key.startswith(("replace_with", "your_", "example"))
                or len(normalized_key) < 32
                or len(set(normalized_key)) < 8
            ):
                raise ValueError(
                    "Production environment requires a strong, explicit SECRET_KEY (at least 32 characters, with varied characters). Replace template values before deployment."
                )
            if (
                not self.DEFAULT_RECRUITER_EMAIL
                or self.DEFAULT_RECRUITER_EMAIL.strip().lower() == "recruiter@smartats.com"
                or self.DEFAULT_RECRUITER_EMAIL.strip().lower().startswith("replace_with")
            ):
                raise ValueError(
                    "Default recruiter email ('recruiter@smartats.com') is prohibited in production. Configure a dedicated, non-default recruiter email."
                )
            if (
                not self.DEFAULT_RECRUITER_PASSWORD
                or self.DEFAULT_RECRUITER_PASSWORD.strip().lower() in insecure_passwords
                or self.DEFAULT_RECRUITER_PASSWORD.strip().lower().startswith("replace_with")
                or len(self.DEFAULT_RECRUITER_PASSWORD.strip()) < 12
            ):
                raise ValueError(
                    "Production environment requires a strong, non-default DEFAULT_RECRUITER_PASSWORD (at least 12 characters). Replace template values before deployment."
                )
            if any(origin == "*" for origin in self.ALLOWED_ORIGINS):
                raise ValueError(
                    "Wildcard '*' in ALLOWED_ORIGINS is prohibited in production when credentials are enabled. Specify explicit domain origins."
                )
            if "replace_with" in self.DATABASE_URL.lower():
                raise ValueError(
                    "Production environment cannot use a template DATABASE_URL. Set a unique database password and connection string."
                )
        return self

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
