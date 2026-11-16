from fastapi import APIRouter
from app.schemas.match import ScoringConfigResponse

router = APIRouter(prefix="/scoring", tags=["Scoring Configuration"])


@router.get("/config", response_model=ScoringConfigResponse)
def get_scoring_config() -> ScoringConfigResponse:
    """
    Returns default scoring weights and formula description for multi-pillar matching.
    """
    return ScoringConfigResponse(
        default_weights={
            "skills": 0.40,
            "text": 0.20,
            "experience": 0.25,
            "education": 0.15,
        },
        formula_description="Final Score = (Skills % × 0.40) + (Semantic Text % × 0.20) + (Experience Fit % × 0.25) + (Education % × 0.15)"
    )
