import os
import sys
import json
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.database.database import SessionLocal, Base, engine
from app.database.models import (
    Job,
    Candidate,
    Application,
    ApplicationStatusHistory,
    ApplicationNote,
)
from app.services.duplicate import calculate_file_hash
from app.services.processor import process_resume_application


def seed_database():
    print("Seeding database with realistic demo data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    dataset_path = os.path.join(PROJECT_ROOT, "data", "evaluation_dataset", "dataset.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Seed Jobs
    job_map = {}
    for job_data in data["jobs"]:
        existing = db.query(Job).filter(Job.title == job_data["title"]).first()
        if not existing:
            job = Job(
                title=job_data["title"],
                description=job_data["description"],
                required_skills=job_data["required_skills"],
                preferred_skills=job_data["preferred_skills"]
            )
            db.add(job)
            db.commit()
            db.refresh(job)
            job_map[job_data["job_id"]] = job.job_id
            print(f"Created Job: {job.title} (ID: {job.job_id})")
        else:
            job_map[job_data["job_id"]] = existing.job_id

    # 2. Seed Candidates & Applications
    test_resumes_dir = os.path.join(PROJECT_ROOT, "data", "test_resumes")
    candidates_data = data["candidates"]

    created_apps = []

    for idx, c_info in enumerate(candidates_data):
        safe_name = c_info["name"].replace(" ", "_").lower()
        pdf_file = os.path.join(test_resumes_dir, f"{safe_name}_resume.pdf")
        docx_file = os.path.join(test_resumes_dir, f"{safe_name}_resume.docx")
        
        file_path = pdf_file if os.path.exists(pdf_file) else docx_file
        if not os.path.exists(file_path):
            continue

        file_hash = calculate_file_hash(file_path)

        # Candidate
        cand = db.query(Candidate).filter(Candidate.email == c_info["email"]).first()
        if not cand:
            cand = Candidate(
                name=c_info["name"],
                email=c_info["email"],
                phone=c_info["phone"],
                extracted_skills=[]
            )
            db.add(cand)
            db.commit()
            db.refresh(cand)

        # Distribute candidates to jobs based on relevance score >= 1
        for j_orig_id, rel_score in c_info["job_relevance"].items():
            if rel_score >= 1 and int(j_orig_id) in job_map:
                real_job_id = job_map[int(j_orig_id)]
                
                existing_app = db.query(Application).filter(
                    Application.job_id == real_job_id,
                    Application.candidate_id == cand.candidate_id
                ).first()

                if not existing_app:
                    app = Application(
                        job_id=real_job_id,
                        candidate_id=cand.candidate_id,
                        resume_path=file_path,
                        file_hash=file_hash,
                        processing_status="PENDING",
                        review_stage="New"
                    )
                    db.add(app)
                    db.commit()
                    db.refresh(app)
                    
                    # Process scoring
                    process_resume_application(app.application_id)
                    db.refresh(app)
                    created_apps.append(app)
                    print(f"Processed Application #{app.application_id} for {cand.name} on Job #{real_job_id}")

    # 3. Distribute applications across realistic hiring stages with audit history
    stage_assignments = [
        ("Hired", [
            ("New", "Reviewing", "Screening profile against requirements"),
            ("Reviewing", "Interviewing", "Passed technical screen, scheduled panel interview"),
            ("Interviewing", "Offer", "Executive panel approved offer terms"),
            ("Offer", "Hired", "Candidate signed and accepted written offer"),
        ]),
        ("Offer", [
            ("New", "Reviewing", "Recruiter screening complete"),
            ("Reviewing", "Interviewing", "Technical evaluation 90%+ fit"),
            ("Interviewing", "Offer", "Formal offer extended to candidate"),
        ]),
        ("Interviewing", [
            ("New", "Reviewing", "Qualified profile"),
            ("Reviewing", "Interviewing", "System design interview scheduled"),
        ]),
        ("Interviewing", [
            ("New", "Reviewing", "Strong portfolio and resume alignment"),
            ("Reviewing", "Interviewing", "Phone screen passed, advancing to live interview"),
        ]),
        ("Reviewing", [
            ("New", "Reviewing", "Initial hiring manager review in progress"),
        ]),
        ("Reviewing", [
            ("New", "Reviewing", "Evaluating transferable engineering skills"),
        ]),
        ("Rejected", [
            ("New", "Reviewing", "Initial screening"),
            ("Reviewing", "Rejected", "Candidate accepted an offer at another company"),
        ]),
    ]

    for i, (target_stage, audit_steps) in enumerate(stage_assignments):
        if i < len(created_apps):
            app = created_apps[i]
            app.review_stage = target_stage
            db.add(app)
            
            for from_s, to_s, note_text in audit_steps:
                hist = ApplicationStatusHistory(
                    application_id=app.application_id,
                    from_stage=from_s,
                    to_stage=to_s,
                    note=note_text,
                    changed_by="Sarah Recruiter",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(hist)
                
                note = ApplicationNote(
                    application_id=app.application_id,
                    content=note_text,
                    author="Sarah Recruiter",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(note)

    # 4. Add 2 realistic duplicate upload events blocked by SHA-256 hash checks
    if created_apps:
        target_app = created_apps[0]
        for _ in range(2):
            dup_hist = ApplicationStatusHistory(
                application_id=target_app.application_id,
                from_stage=target_app.review_stage,
                to_stage=target_app.review_stage,
                note="Duplicate resume upload rejected: identical SHA-256 file hash detected.",
                changed_by="System Guard",
                created_at=datetime.now(timezone.utc)
            )
            db.add(dup_hist)

    db.commit()
    db.close()
    print("Database seeding completed successfully with realistic demo data!")


if __name__ == "__main__":
    seed_database()
