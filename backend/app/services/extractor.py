import re
from typing import List, Optional, Set
from app.services.taxonomy import SKILLS_TAXONOMY, normalize_skill_name


EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    re.IGNORECASE
)

# Handles international (+91, +1), parens (123) 456-7890, and dashed 123-456-7890
PHONE_PATTERN = re.compile(
    r"(?:(?:\+?(\d{1,3}))?[-.\s]?)?(?:\(?(\d{3})\)?[-.\s]?)?(\d{3})[-.\s]?(\d{4})"
)

# Heuristic stop-words that disqualify a line from being a candidate name
NAME_EXCLUDE_TERMS = {
    "resume", "curriculum", "vitae", "cv", "summary", "experience", "education",
    "skills", "projects", "profile", "objective", "contact", "phone", "email",
    "linkedin", "github", "address", "page", "developer", "engineer", "designer",
    "manager", "analyst", "work", "technical", "certified", "university", "college"
}


def extract_email(text: str) -> Optional[str]:
    """
    Extracts candidate email from resume text.
    Returns cleaned lowercase email or None.
    """
    if not text:
        return None
    matches = EMAIL_PATTERN.findall(text)
    for match in matches:
        cleaned = match.strip().rstrip(".,;:)")
        # Exclude fake/boilerplate emails
        if cleaned.lower() not in {"example@example.com", "email@example.com", "user@domain.com"}:
            return cleaned.lower()
    return None


def extract_phone(text: str) -> Optional[str]:
    """
    Extracts candidate phone number using regex pattern and digit validation.
    """
    if not text:
        return None
    matches = PHONE_PATTERN.findall(text)
    for match in matches:
        # Reconstruct full phone digits
        digits = "".join(match)
        if 10 <= len(digits) <= 15:
            # Format nicely
            if len(digits) == 10:
                return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
            return f"+{digits}"
    return None


def extract_name(text: str) -> Optional[str]:
    """
    Conservative heuristic for extracting candidate name from top lines of document.
    Does not assume regex can identify any arbitrary name; validates line structure.
    """
    if not text:
        return None

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Inspect first 8 non-empty lines
    for line in lines[:8]:
        # Skip if contains email or digits or url indicators
        if "@" in line or any(char.isdigit() for char in line) or "http" in line.lower() or "www." in line.lower():
            continue
        
        # Clean line
        words = line.split()
        if len(words) < 2 or len(words) > 4:
            continue
            
        lower_words = [w.lower().strip(",.;:") for w in words]
        if any(w in NAME_EXCLUDE_TERMS for w in lower_words):
            continue

        # Check that words only contain alphabetical characters
        if all(re.match(r"^[A-Za-z\.\'-]+$", w) for w in words):
            # Format cleanly as Title Case
            name = " ".join(w.capitalize() for w in words)
            return name

    return None


def extract_skills(text: str, custom_taxonomy: Optional[dict] = None) -> List[str]:
    """
    Extracts technical skills by scanning text against skills taxonomy aliases
    using strict word boundaries and case-insensitive matching.
    """
    if not text:
        return []

    taxonomy = custom_taxonomy or SKILLS_TAXONOMY
    matched_skills: Set[str] = set()
    text_lower = text.lower()

    for canonical, aliases in taxonomy.items():
        # First check canonical
        canonical_pattern = rf"\b{re.escape(canonical.lower())}\b"
        if re.search(canonical_pattern, text_lower):
            matched_skills.add(canonical)
            continue

        # Then check aliases
        for alias in aliases:
            if alias.startswith(r"\b"):
                # Pre-defined regex with boundary
                if re.search(alias, text_lower, re.IGNORECASE):
                    matched_skills.add(canonical)
                    break
            else:
                escaped = re.escape(alias.lower())
                # Handle boundaries safely without invalid variable lookbehinds
                starts_word = bool(re.match(r"^\w", alias))
                ends_word = bool(re.search(r"\w$", alias))

                prefix = r"\b" if starts_word else r"(?:^|[\s,;.()\[\]])"
                suffix = r"\b" if ends_word else r"(?:$|[\s,;.()\[\]])"
                pattern = rf"{prefix}{escaped}{suffix}"

                if re.search(pattern, text_lower):
                    matched_skills.add(canonical)
                    break

    return sorted(list(matched_skills))
