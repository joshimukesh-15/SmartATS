import hashlib
import os
from typing import Optional
from sqlalchemy.orm import Session
from app.database.models import Application, Candidate


def calculate_file_hash(file_path: str) -> str:
    """
    Computes SHA-256 hash of a file reading in 64KB binary chunks.
    Ensures exact binary duplicate detection regardless of filename.
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()


def calculate_bytes_hash(file_bytes: bytes) -> str:
    """Computes SHA-256 hash directly from file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


def check_duplicate_application(db: Session, job_id: int, file_hash: str) -> Optional[Application]:
    """
    Checks if a resume with the exact same file hash has already been applied to this job.
    """
    return db.query(Application).filter(
        Application.job_id == job_id,
        Application.file_hash == file_hash
    ).first()


def find_candidate_by_email(db: Session, email: Optional[str]) -> Optional[Candidate]:
    """
    Locates existing candidate record by normalized email to prevent duplicating candidate entities.
    """
    if not email:
        return None
    return db.query(Candidate).filter(
        Candidate.email == email.strip().lower()
    ).first()
