from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class CandidateBase(BaseModel):
    name: Optional[str] = Field(None, description="Candidate full name")
    email: Optional[str] = Field(None, description="Candidate email address")
    phone: Optional[str] = Field(None, description="Candidate phone number")


class CandidateCreate(CandidateBase):
    raw_text: Optional[str] = None
    extracted_skills: List[str] = Field(default_factory=list)


class CandidateResponse(CandidateBase):
    candidate_id: int
    raw_text: Optional[str] = None
    extracted_skills: List[str] = Field(default_factory=list)
    created_at: datetime
    applications_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
