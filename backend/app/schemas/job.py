from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Job title")
    description: str = Field(..., min_length=10, description="Full job description")
    required_skills: List[str] = Field(default_factory=list, description="List of mandatory technical skills")
    preferred_skills: List[str] = Field(default_factory=list, description="List of optional preferred skills")
    custom_weights: Optional[Dict[str, float]] = Field(
        None,
        description="Optional custom weights: weight_skills, weight_text, weight_experience, weight_education"
    )


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    custom_weights: Optional[Dict[str, float]] = None


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


class JobResponse(JobBase):
    job_id: int
    created_at: datetime
    updated_at: datetime
    application_count: Optional[int] = 0
    applications_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
