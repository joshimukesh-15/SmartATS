import os
import logging
from typing import Optional
from PIL import Image
import fitz  # PyMuPDF
from app.core.config import settings

logger = logging.getLogger(__name__)

# Check possible Tesseract paths on Windows
TESSERACT_AVAILABLE = False
try:
    import pytesseract

    # Configure path if specified in settings or typical standard paths
    if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    elif os.path.exists(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    elif os.path.exists(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"

    # Test availability
    try:
        pytesseract.get_tesseract_version()
        TESSERACT_AVAILABLE = True
        logger.info("Tesseract OCR is available and configured.")
    except (pytesseract.TesseractNotFoundError, FileNotFoundError, PermissionError, OSError) as e:
        TESSERACT_AVAILABLE = False
        logger.warning("Tesseract binary not detected (%s). OCR fallback will be inactive.", e)
except ImportError:
    pytesseract = None
    logger.warning("pytesseract is not installed.")


def is_ocr_available() -> bool:
    """Returns True if Tesseract OCR is configured and operational."""
    return TESSERACT_AVAILABLE


def extract_ocr_from_pdf(file_path: str, max_pages: int = 5) -> str:
    """
    Extracts text from scanned PDF pages by rendering them to images and applying OCR.
    Fallback pipeline when standard PyMuPDF extracts insufficient text.
    """
    if not is_ocr_available():
        logger.info("OCR is not available on this system. Skipping OCR fallback.")
        return ""

    extracted_pages = []
    try:
        doc = fitz.open(file_path)
        for page_num in range(min(len(doc), max_pages)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            page_text = pytesseract.image_to_string(img)
            if page_text and page_text.strip():
                extracted_pages.append(page_text.strip())
        doc.close()
    except (fitz.FileDataError, fitz.EmptyFileError, OSError, ValueError, RuntimeError) as e:
        logger.exception("Error during OCR extraction on %s: %s", file_path, e)

    return "\n\n".join(extracted_pages)
