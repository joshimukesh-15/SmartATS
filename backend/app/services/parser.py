import os
import re
import logging
from typing import Tuple
import fitz  # PyMuPDF
import docx

from app.core.config import settings
from app.services.ocr import extract_ocr_from_pdf, is_ocr_available

logger = logging.getLogger(__name__)


def clean_extracted_text(text: str) -> str:
    """Removes excessive whitespace, non-printable characters, and normalizes line breaks."""
    if not text:
        return ""
    # Normalize carriage returns and tabs
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Replace non-printable characters except standard newlines and tabs
    text = re.sub(r"[^\x20-\x7E\n\t]", " ", text)
    # Collapse multiple consecutive blank lines into double newline
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces into single space
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def extract_pdf_text(file_path: str) -> Tuple[str, bool]:
    """
    Extracts text from PDF using PyMuPDF.
    If extracted text is under the threshold (scanned document), attempts OCR fallback.
    Returns: (text, used_ocr)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    extracted_pages = []
    try:
        doc = fitz.open(file_path)
        if doc.is_encrypted:
            doc.close()
            raise ValueError("Document is password-protected or encrypted. Please provide an unencrypted document.")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text("text")
            if page_text and page_text.strip():
                extracted_pages.append(page_text.strip())
        doc.close()
    except Exception as e:
        logger.error(f"PyMuPDF error reading {file_path}: {e}")
        raise ValueError(f"Could not read PDF document: {str(e)}")

    full_text = "\n\n".join(extracted_pages)
    cleaned = clean_extracted_text(full_text)

    # Check if text is sufficient or if OCR fallback should be invoked
    if len(cleaned) < settings.OCR_MIN_TEXT_LENGTH:
        logger.info(f"Insufficient text ({len(cleaned)} chars) extracted from {file_path}. Invoking OCR fallback.")
        ocr_text = extract_ocr_from_pdf(file_path)
        if len(ocr_text.strip()) > len(cleaned):
            return clean_extracted_text(ocr_text), True

    return cleaned, False


def extract_docx_text(file_path: str) -> Tuple[str, bool]:
    """
    Extracts text from DOCX using python-docx.
    Extracts text from paragraphs and embedded tables.
    Returns: (text, used_ocr=False)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"DOCX file not found: {file_path}")

    try:
        doc = docx.Document(file_path)
        content_lines = []

        # 1. Paragraph text
        for p in doc.paragraphs:
            if p.text and p.text.strip():
                content_lines.append(p.text.strip())

        # 2. Table text
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    # Deduplicate repeated cell contents from merged cells
                    unique_cells = []
                    for c in row_cells:
                        if not unique_cells or c != unique_cells[-1]:
                            unique_cells.append(c)
                    content_lines.append(" | ".join(unique_cells))

        full_text = "\n".join(content_lines)
        return clean_extracted_text(full_text), False
    except Exception as e:
        logger.error(f"python-docx error reading {file_path}: {e}")
        raise ValueError(f"Could not read DOCX document: {str(e)}")


def extract_resume_text(file_path: str) -> Tuple[str, bool]:
    """
    Detects file extension and routes to appropriate extraction handler.
    Returns: (cleaned_text, used_ocr)
    """
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_pdf_text(file_path)
    elif ext == ".docx":
        return extract_docx_text(file_path)
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Only .pdf and .docx are supported.")
