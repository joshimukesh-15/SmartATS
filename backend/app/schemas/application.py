from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.schemas.candidate import CandidateResponse, CandidateListItemResponse
from app.schemas.pagination import PaginatedResponse


class ReviewStage(str, Enum):
    NEW = "New"
    REVIEWING = "Reviewing"
    INTERVIEWING = "Interviewing"
    OFFER = "Offer"
    HIRED = "Hired"
    REJECTED = "Rejected"


CANONICAL_STAGES: List[str] = [s.value for s in ReviewStage]


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
    weights: Dict[str, float] = Field(default_factory=dict)
    components: Dict[str, Dict[str, float]] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class ApplicationNoteResponse(BaseModel):
    note_id: int
    application_id: int
    content: str
    author: str = "Recruiter"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationStatusHistoryResponse(BaseModel):
    history_id: int
    application_id: int
    from_stage: Optional[str] = None
    to_stage: str
    note: Optional[str] = None
    changed_by: str = "Recruiter"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationStatusUpdateRequest(BaseModel):
    stage: str = Field(..., description="Stage name: New, Reviewing, Interviewing, Offer, Hired, Rejected")
    note: Optional[str] = Field(None, description="Optional note or explanation for the stage transition")
    changed_by: Optional[str] = Field("Recruiter", description="Name of the person making the change")


class ApplicationNoteCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Content of the recruiter note")
    author: Optional[str] = Field("Recruiter", description="Author name")


class ApplicationWorkflowDetailsResponse(BaseModel):
    application_id: int
    review_stage: str
    status_history: List[ApplicationStatusHistoryResponse] = Field(default_factory=list)
    notes: List[ApplicationNoteResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ApplicationResponse(BaseModel):
    application_id: int
    job_id: int
    candidate_id: int
    has_resume: bool = True
    download_url: Optional[str] = None
    file_hash: str
    processing_status: str
    status: Optional[str] = None
    review_stage: str = "New"
    applied_at: datetime
    candidate: Optional[CandidateListItemResponse] = None
    match_result: Optional[MatchResultResponse] = None
    status_history: List[ApplicationStatusHistoryResponse] = Field(default_factory=list)
    notes: List[ApplicationNoteResponse] = Field(default_factory=list)
    weights: Dict[str, float] = Field(default_factory=dict)
    components: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    final_score: float = 0.0

    @model_validator(mode="after")
    def populate_status(self):
        if self.status is None:
            self.status = self.processing_status
        return self

    model_config = ConfigDict(from_attributes=True)


class ApplicationUploadResult(BaseModel):
    filename: str
    status: str
    application_id: Optional[int] = None
    candidate_id: Optional[int] = None
    candidate_name: Optional[str] = None
    file_hash: Optional[str] = None
    message: str


PaginatedApplicationsResponse = PaginatedResponse[ApplicationResponse]
