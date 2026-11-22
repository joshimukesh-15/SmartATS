from typing import List, Dict
from pydantic import BaseModel, Field


class OverviewTotals(BaseModel):
    jobs: int = 0
    active_jobs: int = 0
    candidates: int = 0
    applications: int = 0
    completed: int = 0
    pending: int = 0
    failed: int = 0
    duplicates_blocked: int = 0


class ScoreHistogramBucket(BaseModel):
    label: str
    min: float
    max: float
    count: int = 0


class TopCandidateItem(BaseModel):
    application_id: int
    name: str
    job_title: str
    stage: str
    final_score: float


class OverviewAnalyticsResponse(BaseModel):
    totals: OverviewTotals
    average_score: float
    score_histogram: List[ScoreHistogramBucket] = Field(default_factory=list)
    stage_distribution: Dict[str, int] = Field(default_factory=dict)
    top_candidates: List[TopCandidateItem] = Field(default_factory=list)
