import pytest
from app.services.matcher import (
    evaluate_skill_gaps,
    compute_keyword_score,
    run_hybrid_matching
)
from app.ml.vectorizer import compute_tfidf_similarity


def test_evaluate_skill_gaps():
    candidate_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"]
    required_skills = ["Python", "FastAPI", "PostgreSQL", "AWS", "Kubernetes"]
    preferred_skills = ["Docker", "Redis"]

    matched_req, missing_req, matched_pref = evaluate_skill_gaps(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills
    )

    assert set(matched_req) == {"Python", "FastAPI", "PostgreSQL"}
    assert set(missing_req) == {"AWS", "Kubernetes"}
    assert set(matched_pref) == {"Docker"}


def test_compute_keyword_score():
    assert compute_keyword_score(3, 5) == 60.0
    assert compute_keyword_score(5, 5) == 100.0
    assert compute_keyword_score(0, 5) == 0.0
    assert compute_keyword_score(0, 0) == 100.0


def test_tfidf_similarity():
    doc1 = "Experienced Python backend engineer building REST APIs and microservices."
    doc2 = "We are seeking a Python backend engineer to design REST APIs and microservices."
    score = compute_tfidf_similarity(doc1, doc2)
    assert score > 40.0

    doc3 = "Chef preparing Italian pasta and Mediterranean salads in culinary restaurant."
    score_unrelated = compute_tfidf_similarity(doc1, doc3)
    assert score_unrelated < score


def test_run_hybrid_matching():
    resume = "Experienced Python and FastAPI backend engineer working with PostgreSQL and Docker on AWS."
    skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"]
    job_desc = "Seeking Python engineer with FastAPI and PostgreSQL background."
    required = ["Python", "FastAPI", "PostgreSQL"]
    preferred = ["Docker", "Kubernetes"]

    res = run_hybrid_matching(
        resume_text=resume,
        candidate_skills=skills,
        job_description=job_desc,
        required_skills=required,
        preferred_skills=preferred,
        candidate_name="Sarah Jenkins",
        weight_keyword=0.60,
        weight_tfidf=0.40
    )

    assert res["keyword_score"] == 100.0
    assert res["tfidf_score"] > 20.0
    # Final score = 0.6*100 + 0.4*tfidf
    expected_score = round(60.0 + (0.4 * res["tfidf_score"]), 2)
    assert abs(res["final_score"] - expected_score) < 0.05
    assert len(res["missing_skills"]) == 0
    assert "Docker" in res["preferred_matched_skills"]
    assert "Hybrid Score Formula" in res["score_explanation"]
