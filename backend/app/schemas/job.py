import math
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from app.schemas.pagination import PaginatedResponse


DEFAULT_SCORING_WEIGHTS: Dict[str, float] = {
    "weight_skills": 0.40,
    "weight_text": 0.20,
    "weight_experience": 0.25,
    "weight_education": 0.15,
}


def normalize_weights_dict(weights: Optional[Dict[str, float]]) -> Optional[Dict[str, float]]:
    """
    Validates and normalizes weights:
    - Rejects negative weights
    - Rejects NaN, None, and infinite values
    - Rejects all-zero configurations
    - Normalizes to sum to 1.0 with 3 decimal precision
    """
    if weights is None:
        return None

    cleaned: Dict[str, float] = {}
    for k in ("weight_skills", "weight_text", "weight_experience", "weight_education"):
        val = weights.get(k, DEFAULT_SCORING_WEIGHTS[k])
        if val is None or not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
            raise ValueError(f"Weight '{k}' must be a valid, finite numerical value.")
        if val < 0.0:
            raise ValueError(f"Weight '{k}' must be non-negative (>= 0.0).")
        cleaned[k] = float(val)

    total = sum(cleaned.values())
    if total <= 0.0:
        raise ValueError("Sum of all scoring weights must be strictly greater than 0.0.")

    return {
        k: round(v / total, 3)
        for k, v in cleaned.items()
    }


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Job title")
    description: str = Field(..., min_length=10, description="Full job description")
    required_skills: List[str] = Field(default_factory=list, description="List of mandatory technical skills")
    preferred_skills: List[str] = Field(default_factory=list, description="List of optional preferred skills")
    custom_weights: Optional[Dict[str, float]] = Field(
        None,
        description="Optional custom weights: weight_skills (0.40), weight_text (0.20), weight_experience (0.25), weight_education (0.15)"
    )

    @field_validator("custom_weights", mode="before")
    @classmethod
    def validate_custom_weights(cls, v):
        return normalize_weights_dict(v)


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    custom_weights: Optional[Dict[str, float]] = None

    @field_validator("custom_weights", mode="before")
    @classmethod
    def validate_custom_weights(cls, v):
        return normalize_weights_dict(v)


class JobQualityIssue(BaseModel):
    category: str = Field(..., description="missing_info, vague_requirements, restrictive_wording")
    severity: str = Field(..., description="critical, warning, suggestion")
    title: str
    message: str
    suggestion: str
    detected_text: Optional[str] = None


class JobQualityCheckRequest(BaseModel):
    title: str
    description: str
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)


class JobQualityCheckResponse(BaseModel):
    overall_score: int
    grade: str
    summary: str
    word_count: int
    has_salary: bool
    has_location: bool
    has_employment_type: bool
    required_skills_count: int
    issues: List[JobQualityIssue]
    metrics: Dict[str, Any]


class JobWeightsUpdateRequest(BaseModel):
    weight_skills: float = Field(..., ge=0.0, le=1.0)
    weight_text: float = Field(..., ge=0.0, le=1.0)
    weight_experience: float = Field(..., ge=0.0, le=1.0)
    weight_education: float = Field(..., ge=0.0, le=1.0)

    @model_validator(mode="after")
    def validate_weights_sum(self):
        for name in ("weight_skills", "weight_text", "weight_experience", "weight_education"):
            val = getattr(self, name)
            if math.isnan(val) or math.isinf(val):
                raise ValueError(f"Weight '{name}' cannot be NaN or infinite.")
        total = self.weight_skills + self.weight_text + self.weight_experience + self.weight_education
        if total <= 0.0:
            raise ValueError("The sum of recruiter weights must be strictly greater than 0.0.")
        return self


class JobResponse(JobBase):
    job_id: int
    created_at: datetime
    updated_at: datetime
    application_count: Optional[int] = 0
    applications_count: Optional[int] = 0
    status: Optional[str] = "Active"

    model_config = ConfigDict(from_attributes=True)


PaginatedJobsResponse = PaginatedResponse[JobResponse]
