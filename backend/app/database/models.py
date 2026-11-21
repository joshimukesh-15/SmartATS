from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database.database import Base


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list, nullable=False)
    preferred_skills = Column(JSON, default=list, nullable=False)
    custom_weights = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    applications = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan",
        order_by="desc(Application.applied_at)"
    )


class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(100), nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    applications = relationship(
        "Application",
        back_populates="candidate",
        cascade="all, delete-orphan",
        order_by="desc(Application.applied_at)"
    )


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("job_id", "file_hash", name="uq_applications_job_id_file_hash"),
    )

    application_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id", ondelete="CASCADE"), nullable=False, index=True)
    resume_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)
    processing_status = Column(String(50), default="PENDING", nullable=False)  # PENDING, PROCESSING, COMPLETED, FAILED, DUPLICATE
    review_stage = Column(String(50), default="New", nullable=False, index=True)  # New, Reviewing, Interview, Rejected, Hired
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    match_result = relationship(
        "MatchResult",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan"
    )
    status_history = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="desc(ApplicationStatusHistory.created_at)"
    )
    notes = relationship(
        "ApplicationNote",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="desc(ApplicationNote.created_at)"
    )


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    history_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(
        Integer,
        ForeignKey("applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    from_stage = Column(String(50), nullable=True)
    to_stage = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    changed_by = Column(String(100), default="Recruiter", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="status_history")


class ApplicationNote(Base):
    __tablename__ = "application_notes"

    note_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(
        Integer,
        ForeignKey("applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    content = Column(Text, nullable=False)
    author = Column(String(100), default="Recruiter", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="notes")


class MatchResult(Base):
    __tablename__ = "match_results"
    __table_args__ = (
        UniqueConstraint("application_id", name="uq_match_results_application_id"),
    )

    match_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(
        Integer,
        ForeignKey("applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    keyword_score = Column(Float, default=0.0, nullable=False)
    tfidf_score = Column(Float, default=0.0, nullable=False)
    final_score = Column(Float, default=0.0, nullable=False)
    matched_skills = Column(JSON, default=list, nullable=False)
    missing_skills = Column(JSON, default=list, nullable=False)
    preferred_matched_skills = Column(JSON, default=list, nullable=False)
    score_explanation = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    application = relationship("Application", back_populates="match_result")
