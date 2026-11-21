import os
import pytest
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Application, Candidate, MatchResult
from app.schemas.job import JobCreate, JobUpdate
from app.api import jobs, resumes
from app.ml.vectorizer import (
    compute_tfidf_similarity,
    build_job_corpus,
    fit_job_vectorizer,
    load_neutral_corpus,
    create_tfidf_vectorizer,
    vectorizer_cache
)
from app.services.scoring import rescore_job_applications


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_identical_text_near_100_unrelated_near_0():
    """Identical text scores near 100; unrelated text near 0."""
    doc_tech = (
        "Senior Python backend engineer building scalable microservices and REST APIs "
        "with FastAPI, Django, PostgreSQL, Redis, Docker, and AWS."
    )
    doc_unrelated = (
        "Pastry chef preparing Italian pasta dishes, wood fired pizza, and Mediterranean salads "
        "in a fine dining restaurant kitchen."
    )

    # Identical text score
    score_identical = compute_tfidf_similarity(doc_tech, doc_tech)
    assert score_identical >= 95.0, f"Expected near 100, got {score_identical}"
    assert score_identical == 100.0, f"Expected exactly 100.0, got {score_identical}"

    # Unrelated text score
    score_unrelated = compute_tfidf_similarity(doc_tech, doc_unrelated)
    assert score_unrelated <= 5.0, f"Expected near 0, got {score_unrelated}"
    assert score_unrelated == 0.0, f"Expected exactly 0.0 for disjoint vocabulary, got {score_unrelated}"


def test_determinism_same_input_gives_same_score():
    """Same input always gives the same score (determinism)."""
    doc1 = "Python developer with experience in Django, FastAPI, PostgreSQL, and cloud deployments."
    doc2 = "We are seeking a Python engineer skilled in FastAPI and PostgreSQL database design."

    score_1 = compute_tfidf_similarity(doc1, doc2)
    for _ in range(10):
        score_k = compute_tfidf_similarity(doc1, doc2)
        assert score_k == score_1, f"Non-deterministic score: {score_k} vs {score_1}"

    # Verify vectorizer fitting determinism
    v1 = fit_job_vectorizer(job_text=doc1, resume_texts=[doc2])
    v2 = fit_job_vectorizer(job_text=doc1, resume_texts=[doc2])
    assert list(v1.vocabulary_.keys()) == list(v2.vocabulary_.keys())
    assert (v1.idf_ == v2.idf_).all()


def test_neutral_corpus_loaded_and_used_under_5_resumes():
    """
    Neutral corpus in neutral_corpus.txt has ~50 generic technical JDs.
    If a job has fewer than 5 resumes, neutral corpus is included in the fit for IDF stability.
    If >= 5 resumes, neutral corpus is not included.
    """
    neutral_docs = load_neutral_corpus()
    assert len(neutral_docs) >= 50, f"Expected at least 50 neutral descriptions, got {len(neutral_docs)}"

    job_text = "Backend engineer needed for cloud microservices."
    few_resumes = ["Python FastAPI resume.", "Django PostgreSQL resume."]

    # Under 5 resumes -> includes neutral corpus
    corpus_under_5 = build_job_corpus(job_text, few_resumes)
    expected_len = 1 + len(few_resumes) + len(neutral_docs)
    assert len(corpus_under_5) == expected_len

    # 5 or more resumes -> does not include neutral corpus
    five_resumes = [f"Technical resume candidate {i} with Python skills." for i in range(5)]
    corpus_5 = build_job_corpus(job_text, five_resumes)
    assert len(corpus_5) == 1 + len(five_resumes)


def test_vectorizer_cache_versioning():
    """In-memory vectorizer cache caches per job with version that increments on upload, delete, and job edit."""
    test_job_id = 99991
    vectorizer_cache.clear()

    # Initial version
    v1 = vectorizer_cache.get_version(test_job_id)
    assert v1 == 1

    # Cache a vectorizer
    vec = create_tfidf_vectorizer()
    vec.fit(["sample text document for test"])
    vectorizer_cache.set_vectorizer(test_job_id, vec, version=v1)

    cached_vec = vectorizer_cache.get_vectorizer(test_job_id)
    assert cached_vec is not None

    # Invalidate / increment version
    v2 = vectorizer_cache.increment_version(test_job_id)
    assert v2 == 2
    assert vectorizer_cache.get_vectorizer(test_job_id) is None, "Cache should be invalidated"

    # Set new vectorizer at version 2
    vectorizer_cache.set_vectorizer(test_job_id, vec, version=v2)
    assert vectorizer_cache.get_version(test_job_id) == 2

    # Invalidate again (e.g. on delete)
    v3 = vectorizer_cache.invalidate(test_job_id)
    assert v3 == 3
    assert vectorizer_cache.get_vectorizer(test_job_id) is None


def test_rescore_after_adding_unrelated_resume_preserves_ranking(db_session):
    """
    After adding an unrelated resume, previously scored candidates are re-scored
    and ranking order among them does not change unexpectedly.
    """
    # 1. Create a job
    job_in = JobCreate(
        title="Senior Python Backend Developer",
        description="Looking for an experienced Python developer with FastAPI, PostgreSQL, and Redis expertise.",
        required_skills=["Python", "FastAPI", "PostgreSQL"],
        preferred_skills=["Redis", "Docker"]
    )
    job = jobs.create_job(job_in, db_session)

    # 2. Add Candidate A (strong match)
    cand_a = Candidate(
        name="Alice Strong",
        email=f"alice_{job.job_id}@test.com",
        raw_text="Senior Python developer with 6 years building FastAPI services, PostgreSQL databases, and Redis caching.",
        extracted_skills=["Python", "FastAPI", "PostgreSQL", "Redis"]
    )
    db_session.add(cand_a)
    db_session.commit()

    app_a = Application(
        job_id=job.job_id,
        candidate_id=cand_a.candidate_id,
        resume_path="dummy/alice.pdf",
        file_hash=f"hash_alice_{job.job_id}",
        processing_status="PENDING"
    )
    db_session.add(app_a)
    db_session.commit()

    # 3. Add Candidate B (moderate/partial match)
    cand_b = Candidate(
        name="Bob Moderate",
        email=f"bob_{job.job_id}@test.com",
        raw_text="Java software engineer with knowledge of Spring Boot and SQL databases. Some Python scripting.",
        extracted_skills=["Java", "Python", "SQL"]
    )
    db_session.add(cand_b)
    db_session.commit()

    app_b = Application(
        job_id=job.job_id,
        candidate_id=cand_b.candidate_id,
        resume_path="dummy/bob.pdf",
        file_hash=f"hash_bob_{job.job_id}",
        processing_status="PENDING"
    )
    db_session.add(app_b)
    db_session.commit()

    # Initial scoring
    rescore_job_applications(job.job_id, db=db_session)
    db_session.expire_all()

    match_a_1 = db_session.query(MatchResult).filter(MatchResult.application_id == app_a.application_id).first()
    match_b_1 = db_session.query(MatchResult).filter(MatchResult.application_id == app_b.application_id).first()

    assert match_a_1 is not None and match_b_1 is not None
    assert match_a_1.final_score > match_b_1.final_score
    assert match_a_1.tfidf_score > match_b_1.tfidf_score

    initial_score_a = match_a_1.final_score
    initial_score_b = match_b_1.final_score

    # 4. Add Candidate C (completely unrelated)
    cand_c = Candidate(
        name="Charlie Chef",
        email=f"charlie_{job.job_id}@test.com",
        raw_text="Head culinary chef specializing in Italian pasta, pizza recipes, pastry, and bakery kitchen management.",
        extracted_skills=["Culinary", "Cooking", "Menu Planning"]
    )
    db_session.add(cand_c)
    db_session.commit()

    app_c = Application(
        job_id=job.job_id,
        candidate_id=cand_c.candidate_id,
        resume_path="dummy/charlie.pdf",
        file_hash=f"hash_charlie_{job.job_id}",
        processing_status="PENDING"
    )
    db_session.add(app_c)
    db_session.commit()

    # Trigger re-scoring of all applications for the job
    vectorizer_cache.increment_version(job.job_id)
    rescored_ids = rescore_job_applications(job.job_id, db=db_session)
    db_session.expire_all()

    assert len(rescored_ids) == 3

    match_a_2 = db_session.query(MatchResult).filter(MatchResult.application_id == app_a.application_id).first()
    match_b_2 = db_session.query(MatchResult).filter(MatchResult.application_id == app_b.application_id).first()
    match_c_2 = db_session.query(MatchResult).filter(MatchResult.application_id == app_c.application_id).first()

    # Candidate C should score near 0
    assert match_c_2.tfidf_score <= 5.0
    assert match_c_2.final_score < match_b_2.final_score

    # Ranking order between A and B must remain preserved
    assert match_a_2.final_score > match_b_2.final_score > match_c_2.final_score
    # Scores for A and B remain stable (anchored by neutral corpus)
    assert abs(match_a_2.final_score - initial_score_a) < 5.0
    assert abs(match_b_2.final_score - initial_score_b) < 5.0


def test_ranking_stable_when_same_resumes_uploaded_in_different_order(db_session):
    """Ranking is stable when the same resumes are uploaded in a different order."""
    resume_texts = {
        "Python": "Expert Python developer with 7 years of FastAPI, PostgreSQL, Docker, and Redis.",
        "Java": "Java enterprise backend engineer with Spring Boot, Hibernate, microservices, and MySQL.",
        "Frontend": "Frontend engineer specialized in React, Next.js, TypeScript, and Tailwind CSS."
    }
    skills_map = {
        "Python": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        "Java": ["Java", "Spring Boot", "MySQL"],
        "Frontend": ["React", "TypeScript", "Tailwind CSS"]
    }

    # Job 1: Upload in order [Python, Java, Frontend]
    job1_in = JobCreate(
        title="Full Stack Software Engineer",
        description="Seeking software engineer with Python and React skills to design APIs and UI.",
        required_skills=["Python", "React"]
    )
    job1 = jobs.create_job(job1_in, db_session)

    # Job 2: Upload in reverse order [Frontend, Java, Python]
    job2_in = JobCreate(
        title="Full Stack Software Engineer",
        description="Seeking software engineer with Python and React skills to design APIs and UI.",
        required_skills=["Python", "React"]
    )
    job2 = jobs.create_job(job2_in, db_session)

    # Order 1: Python, Java, Frontend
    order_1 = ["Python", "Java", "Frontend"]
    apps_job1 = {}
    for role in order_1:
        cand = Candidate(
            name=f"Candidate {role} J1",
            email=f"cand_{role}_j1@test.com",
            raw_text=resume_texts[role],
            extracted_skills=skills_map[role]
        )
        db_session.add(cand)
        db_session.commit()
        app = Application(
            job_id=job1.job_id,
            candidate_id=cand.candidate_id,
            resume_path=f"dummy/{role}_j1.pdf",
            file_hash=f"hash_{role}_j1",
            processing_status="PENDING"
        )
        db_session.add(app)
        db_session.commit()
        apps_job1[role] = app

    # Order 2: Frontend, Java, Python
    order_2 = ["Frontend", "Java", "Python"]
    apps_job2 = {}
    for role in order_2:
        cand = Candidate(
            name=f"Candidate {role} J2",
            email=f"cand_{role}_j2@test.com",
            raw_text=resume_texts[role],
            extracted_skills=skills_map[role]
        )
        db_session.add(cand)
        db_session.commit()
        app = Application(
            job_id=job2.job_id,
            candidate_id=cand.candidate_id,
            resume_path=f"dummy/{role}_j2.pdf",
            file_hash=f"hash_{role}_j2",
            processing_status="PENDING"
        )
        db_session.add(app)
        db_session.commit()
        apps_job2[role] = app

    # Rescore both jobs
    rescore_job_applications(job1.job_id, db=db_session)
    rescore_job_applications(job2.job_id, db=db_session)
    db_session.expire_all()

    # Compare scores for corresponding resumes
    for role in ["Python", "Java", "Frontend"]:
        match1 = db_session.query(MatchResult).filter(MatchResult.application_id == apps_job1[role].application_id).first()
        match2 = db_session.query(MatchResult).filter(MatchResult.application_id == apps_job2[role].application_id).first()
        assert match1 is not None and match2 is not None
        assert match1.tfidf_score == match2.tfidf_score, (
            f"Role {role} tfidf differs between upload orders: {match1.tfidf_score} vs {match2.tfidf_score}"
        )
        assert match1.final_score == match2.final_score, (
            f"Role {role} final score differs between upload orders: {match1.final_score} vs {match2.final_score}"
        )


def test_status_re_scoring_exposed_during_rescore(db_session):
    """Exposes status 'Re-scoring' for applications and job until background scoring finishes."""
    job_in = JobCreate(
        title="DevOps Engineer",
        description="Manage Kubernetes clusters, Terraform, Docker, and AWS CI/CD pipelines.",
        required_skills=["Kubernetes", "Docker", "Terraform", "AWS"]
    )
    job = jobs.create_job(job_in, db_session)

    cand = Candidate(
        name="DevOps Dan",
        email=f"dan_{job.job_id}@test.com",
        raw_text="Experienced DevOps engineer managing Kubernetes, Terraform, Docker, and AWS.",
        extracted_skills=["Kubernetes", "Docker", "Terraform", "AWS"]
    )
    db_session.add(cand)
    db_session.commit()

    app = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path="dummy/dan.pdf",
        file_hash=f"hash_dan_{job.job_id}",
        processing_status="COMPLETED"
    )
    db_session.add(app)
    db_session.commit()

    # Simulate trigger: set status to Re-scoring
    vectorizer_cache.set_job_status(job.job_id, "Re-scoring")
    app.processing_status = "Re-scoring"
    db_session.commit()
    db_session.refresh(app)

    # Verify Job (ORM property & API response) and Application expose Re-scoring
    job_db = db_session.query(Job).filter(Job.job_id == job.job_id).first()
    assert job_db.status == "Re-scoring"
    job_api = jobs.get_job(job.job_id, db=db_session)
    assert job_api.status == "Re-scoring"
    assert app.processing_status == "Re-scoring"

    # Re-scoring finishes
    rescore_job_applications(job.job_id, db=db_session)
    db_session.expire_all()
    db_session.refresh(app)

    # After completion, status is COMPLETED and job status is Active
    assert app.processing_status == "COMPLETED"
    assert job_db.status == "Active"
    assert jobs.get_job(job.job_id, db=db_session).status == "Active"


def test_job_edit_triggers_vectorizer_invalidation_and_version_increment(db_session):
    """Whenever a job description is edited, vectorizer is invalidated and version increments."""
    job_in = JobCreate(
        title="Frontend Specialist",
        description="Vue 3 and TypeScript frontend engineer.",
        required_skills=["Vue", "TypeScript"]
    )
    job = jobs.create_job(job_in, db_session)
    initial_version = vectorizer_cache.get_version(job.job_id)

    # Edit job description
    update_payload = JobUpdate(description="Updated description requiring React, Vue 3, and TypeScript frontend engineer.")
    jobs.update_job(job.job_id, update_payload, db=db_session)

    new_version = vectorizer_cache.get_version(job.job_id)
    assert new_version == initial_version + 1


def test_application_delete_triggers_vectorizer_invalidation_and_rescore(db_session):
    """Whenever an application is deleted, vectorizer is invalidated and remaining applications are re-scored."""
    job_in = JobCreate(
        title="Security Analyst",
        description="Cybersecurity specialist with SIEM, incident response, and penetration testing.",
        required_skills=["SIEM", "Penetration Testing"]
    )
    job = jobs.create_job(job_in, db_session)

    cand1 = Candidate(name="Sec One", email=f"sec1_{job.job_id}@test.com", raw_text="SIEM analyst", extracted_skills=["SIEM"])
    cand2 = Candidate(name="Sec Two", email=f"sec2_{job.job_id}@test.com", raw_text="Penetration tester", extracted_skills=["Penetration Testing"])
    db_session.add_all([cand1, cand2])
    db_session.commit()

    app1 = Application(job_id=job.job_id, candidate_id=cand1.candidate_id, resume_path="dummy/s1.pdf", file_hash=f"h1_{job.job_id}", processing_status="COMPLETED")
    app2 = Application(job_id=job.job_id, candidate_id=cand2.candidate_id, resume_path="dummy/s2.pdf", file_hash=f"h2_{job.job_id}", processing_status="COMPLETED")
    db_session.add_all([app1, app2])
    db_session.commit()

    v_before = vectorizer_cache.get_version(job.job_id)

    # Delete app1
    resumes.delete_application(app1.application_id, db=db_session)

    v_after = vectorizer_cache.get_version(job.job_id)
    assert v_after == v_before + 1

    # Remaining app2 is re-scored and COMPLETED
    db_session.expire_all()
    remaining_app2 = db_session.query(Application).filter(Application.application_id == app2.application_id).first()
    assert remaining_app2 is not None
    assert remaining_app2.processing_status == "COMPLETED"
