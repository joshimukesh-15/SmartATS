from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.candidate import CandidateResponse


class MatchResultResponse(BaseModel):
    match_id: int
    application_id: int
    keyword_score: float
    tfidf_score: float
    final_score: float
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    preferred_matched_skills: List[str] = Field(default_factory=list)
    score_explanation: Optional[str] = None
    evaluated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationResponse(BaseModel):
    application_id: int
    job_id: int
    candidate_id: int
    resume_path: str
    file_hash: str
    processing_status: str
    applied_at: datetime
    candidate: Optional[CandidateResponse] = None
    match_result: Optional[MatchResultResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ApplicationUploadResult(BaseModel):
    filename: str
    status: str
    application_id: Optional[int] = None
    candidate_id: Optional[int] = None
    candidate_name: Optional[str] = None
    file_hash: Optional[str] = None
    message: str
