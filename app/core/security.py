import re
import os
import secrets
from typing import Tuple


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes uploaded filename by stripping path traversals,
    removing non-alphanumeric chars (preserving extension),
    and appending random entropy to prevent collisions.
    """
    base_name = os.path.basename(filename)
    name, ext = os.path.splitext(base_name)
    
    # Strip dangerous characters
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)[:50]
    safe_ext = ext.lower()
    
    # Add random hex to guarantee uniqueness
    random_suffix = secrets.token_hex(4)
    return f"{safe_name}_{random_suffix}{safe_ext}"


def validate_file_extension(filename: str) -> Tuple[bool, str]:
    """
    Validates allowed file extensions for resume uploads (PDF, DOCX).
    """
    allowed_extensions = {".pdf", ".docx"}
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_extensions:
        return False, f"Unsupported file format '{ext}'. Only PDF and DOCX files are supported."
    return True, ""
