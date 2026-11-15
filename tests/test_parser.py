import os
import pytest
from app.services.parser import (
    clean_extracted_text,
    extract_pdf_text,
    extract_docx_text,
    extract_resume_text
)


def test_clean_extracted_text():
    raw = "John   Doe \r\n\r\n\r\n Software Engineer   \t\n\n Skills: Python"
    cleaned = clean_extracted_text(raw)
    assert "John Doe" in cleaned
    assert "\r" not in cleaned
    assert "\n\n\n" not in cleaned


def test_extract_pdf_text():
    sample_pdf = os.path.abspath("data/test_resumes/sarah_jenkins_resume.pdf")
    if os.path.exists(sample_pdf):
        text, used_ocr = extract_pdf_text(sample_pdf)
        assert len(text) > 100
        assert "Sarah Jenkins" in text or "jenkins" in text.lower()
        assert "Python" in text


def test_extract_docx_text():
    sample_docx = os.path.abspath("data/test_resumes/alex_rivera_resume.docx")
    if os.path.exists(sample_docx):
        text, used_ocr = extract_docx_text(sample_docx)
        assert len(text) > 100
        assert "Alex Rivera" in text or "rivera" in text.lower()
        assert "React" in text


def test_unsupported_file_extension():
    with pytest.raises(ValueError, match="Unsupported file format"):
        extract_resume_text("invalid_file.txt")
