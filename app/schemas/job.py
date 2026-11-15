from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Job title")
    description: str = Field(..., min_length=10, description="Full job description")
    required_skills: List[str] = Field(default_factory=list, description="List of mandatory technical skills")
    preferred_skills: List[str] = Field(default_factory=list, description="List of optional preferred skills")


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None


class JobResponse(JobBase):
    job_id: int
    created_at: datetime
    updated_at: datetime
    applications_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
