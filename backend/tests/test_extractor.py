import pytest
from app.services.extractor import (
    extract_email,
    extract_phone,
    extract_name,
    extract_skills
)


def test_extract_email():
    text = "Candidate Name\nEmail: john.doe@techcorp.io\nContact details."
    assert extract_email(text) == "john.doe@techcorp.io"

    # Edge cases
    assert extract_email("Contact: dev+user123@domain.co.uk;") == "dev+user123@domain.co.uk"
    assert extract_email("No email present here") is None


def test_extract_phone():
    assert extract_phone("Call me at (415) 555-0199 or office") == "(415) 555-0199"
    assert extract_phone("Phone: +1-202-555-0143.") is not None
    assert extract_phone("No digits here") is None


def test_extract_name():
    text = "Sarah Jenkins\nsarah@example.com\n(415) 555-0192\nSan Francisco, CA"
    name = extract_name(text)
    assert name == "Sarah Jenkins"

    resume_header = "RESUME\nAlex Rivera\nDeveloper"
    assert extract_name(resume_header) == "Alex Rivera"


def test_extract_skills():
    text = """
    Software Engineer with hands-on experience in Python, FastAPI, Docker, and PostgreSQL.
    Proficient with React, TypeScript, C++, and AWS cloud deployment.
    Knowledge of CI/CD pipelines and Git version control.
    """
    skills = extract_skills(text)
    
    assert "Python" in skills
    assert "FastAPI" in skills
    assert "Docker" in skills
    assert "PostgreSQL" in skills
    assert "React" in skills
    assert "TypeScript" in skills
    assert "C++" in skills
    assert "AWS" in skills
    assert "CI/CD" in skills
    assert "Git" in skills

    # Ensure negative false positives are avoided
    assert "C#" not in skills
    assert "Go" not in skills
