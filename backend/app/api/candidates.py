from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Candidate, Application
from app.schemas.candidate import CandidateResponse, CandidateListItemResponse, PaginatedCandidatesResponse
from app.schemas.pagination import resolve_param

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=PaginatedCandidatesResponse)
def list_candidates(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    skip: Optional[int] = Query(None, ge=0)
):
    """Retrieves paginated registered candidate profiles without leaking full raw resume text."""
    limit = resolve_param(limit, 50)
    offset = resolve_param(offset, 0)
    skip = resolve_param(skip, None)

    if limit == 0 and offset > 0:
        limit, offset = offset, limit
    if skip is not None:
        offset = skip

    if limit < 1 or limit > 200:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 200")

    total = db.query(func.count(Candidate.candidate_id)).scalar() or 0
    candidates = db.query(Candidate).order_by(Candidate.created_at.desc()).offset(offset).limit(limit).all()
    candidate_ids = [candidate.candidate_id for candidate in candidates]
    count_by_candidate = {}
    if candidate_ids:
        count_by_candidate = dict(
            db.query(Application.candidate_id, func.count(Application.application_id))
            .filter(Application.candidate_id.in_(candidate_ids))
            .group_by(Application.candidate_id)
            .all()
        )
    results = []
    for c in candidates:
        cand_resp = CandidateListItemResponse.model_validate(c)
        cand_resp.applications_count = count_by_candidate.get(c.candidate_id, 0)
        results.append(cand_resp)

    return PaginatedCandidatesResponse(
        items=results,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Retrieves full candidate profile including extracted skills and raw resume text."""
    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    app_count = db.query(Application).filter(Application.candidate_id == candidate.candidate_id).count()
    resp = CandidateResponse.model_validate(candidate)
    resp.applications_count = app_count
    return resp
