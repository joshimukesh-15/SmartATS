from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator
from app.schemas.application import (
    MatchResultResponse,
    ApplicationNoteResponse,
    ApplicationStatusHistoryResponse
)


class RankingItem(BaseModel):
    rank: int
    application_id: int
    candidate_id: int
    candidate_name: Optional[str] = "Unknown"
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    processing_status: str
    status: Optional[str] = None
    review_stage: str = "New"
    final_score: float
    keyword_score: float
    tfidf_score: float
    experience_score: Optional[float] = None
    education_score: Optional[float] = None
    experience_years: Optional[float] = 0.0
    seniority_level: Optional[str] = "Junior / Entry"
    education_level: Optional[str] = "Unspecified"
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    equivalent_skills: Dict[str, str] = Field(default_factory=dict)
    preferred_matched_skills: List[str] = Field(default_factory=list)
    weights: Dict[str, float] = Field(default_factory=dict)
    components: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    score_breakdown: Optional[Dict[str, float]] = None
    score_explanation: Optional[str] = None
    notes: List[ApplicationNoteResponse] = Field(default_factory=list)
    status_history: List[ApplicationStatusHistoryResponse] = Field(default_factory=list)
    applied_at: datetime

    @model_validator(mode="after")
    def populate_status(self):
        if self.status is None:
            self.status = self.processing_status
        return self


class JobRankingsResponse(BaseModel):
    job_id: int
    job_title: str
    total_candidates: int
    processed_count: int
    weights_applied: Optional[Dict[str, float]] = None
    rankings: List[RankingItem]


class CandidateCompareRequest(BaseModel):
    application_ids: List[int] = Field(..., min_length=2, max_length=5, description="2 to 5 application IDs to compare")


class CandidateCompareItem(BaseModel):
    application_id: int
    candidate_id: int
    candidate_name: str
    review_stage: str = "New"
    final_score: float
    keyword_score: float
    tfidf_score: float
    experience_score: Optional[float] = 0.0
    education_score: Optional[float] = 0.0
    experience_years: Optional[float] = 0.0
    seniority_level: Optional[str] = "Junior / Entry"
    education_level: Optional[str] = "Unspecified"
    matched_skills: List[str]
    missing_skills: List[str]
    equivalent_skills: Dict[str, str] = Field(default_factory=dict)
    preferred_matched_skills: List[str]
    weights: Dict[str, float] = Field(default_factory=dict)
    components: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    score_breakdown: Optional[Dict[str, float]] = None
    score_explanation: Optional[str] = None
    total_extracted_skills: int
    applied_at: datetime


class CandidateCompareResponse(BaseModel):
    job_id: int
    job_title: str
    required_skills: List[str]
    preferred_skills: List[str]
    candidates: List[CandidateCompareItem]
    common_matched_skills: List[str]
    skill_matrix: Dict[str, Dict[str, bool]]  # skill -> { candidate_name: bool }


class ScoringConfigResponse(BaseModel):
    default_weights: Dict[str, float]
    formula_description: str
