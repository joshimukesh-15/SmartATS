import re
from typing import List, Optional, Set, Dict, Any
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


def extract_experience_years(text: str) -> float:
    """
    Extracts total professional experience years from resume text
    via explicit statement mentions or work history date spans.
    """
    if not text:
        return 0.0

    max_years = 0.0

    # 1. Check explicit mentions (e.g. "6+ years of experience", "5.5 yrs experience")
    explicit_pattern = re.compile(
        r"(?:(?:over|more than|around|approx(?:\.|\b))\s+)?(\d{1,2}(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:professional\s+|relevant\s+|industry\s+|software\s+)?experience",
        re.IGNORECASE
    )
    for match in explicit_pattern.finditer(text):
        try:
            val = float(match.group(1))
            if 0.5 <= val <= 35.0 and val > max_years:
                max_years = val
        except (ValueError, IndexError):
            pass

    # 2. Check employment date spans (e.g. "2018 - 2024", "2019 – Present")
    year_span_pattern = re.compile(
        r"\b(20[0-2]\d|199\d)\s*(?:[-–—to]+|\s+to\s+)\s*(20[0-2]\d|present|current)\b",
        re.IGNORECASE
    )
    current_year = 2026
    total_span_years = 0.0

    spans = []
    for match in year_span_pattern.finditer(text):
        start_y = int(match.group(1))
        end_str = match.group(2).lower()
        end_y = current_year if end_str in {"present", "current"} else int(end_str)
        if 1990 <= start_y <= end_y <= current_year + 1:
            diff = max(0.5, float(end_y - start_y))
            spans.append(diff)

    if spans:
        span_total = min(35.0, sum(spans))
        if span_total > max_years:
            max_years = span_total

    return round(max_years, 1)


def extract_seniority_level(text: str, experience_years: float = 0.0) -> str:
    """
    Infers candidate seniority level from resume job titles and years of experience.
    Returns: 'Lead / Principal', 'Senior', 'Mid-Level', or 'Junior / Entry'.
    """
    if not text:
        return "Junior / Entry"

    text_lower = text.lower()

    # High-level titles
    if re.search(r"\b(?:principal|staff|architect|director|vp of engineering|head of engineering)\b", text_lower):
        return "Lead / Principal"
    if re.search(r"\b(?:tech lead|technical lead|team lead|lead engineer|lead developer)\b", text_lower):
        return "Lead / Principal"

    # Senior titles
    if re.search(r"\b(?:senior|sr\.?|senior engineer|senior developer|sr engineer)\b", text_lower) or experience_years >= 5.0:
        return "Senior"

    # Mid-level
    if re.search(r"\b(?:mid[- ]level|engineer ii|developer ii)\b", text_lower) or experience_years >= 2.0:
        return "Mid-Level"

    return "Junior / Entry"


def extract_education(text: str) -> Dict[str, Optional[str]]:
    """
    Identifies highest degree level and field of study from resume text.
    """
    if not text:
        return {"degree": "Unspecified", "field": None, "degree_level": 1}

    text_lower = text.lower()

    # Degree Level Matching
    degree = "Unspecified"
    level = 1

    if re.search(r"\b(?:ph\.?d|doctorate|doctor of philosophy)\b", text_lower):
        degree = "PhD / Doctorate"
        level = 5
    elif re.search(r"\b(?:master(?:'s)?|m\.?s\.?|m\.?tech|mba|m\.?eng)\b", text_lower):
        degree = "Master's Degree"
        level = 4
    elif re.search(r"\b(?:bachelor(?:'s)?|b\.?s\.?|b\.?tech|b\.?e\.?|b\.?a\.?)\b", text_lower):
        degree = "Bachelor's Degree"
        level = 3
    elif re.search(r"\b(?:associate(?:'s)?|diploma)\b", text_lower):
        degree = "Associate Degree"
        level = 2
    elif re.search(r"\b(?:bootcamp|certified|certificate)\b", text_lower):
        degree = "Certificate / Bootcamp"
        level = 2

    # Field of Study Matching
    field = None
    if re.search(r"\bcomputer science\b", text_lower):
        field = "Computer Science"
    elif re.search(r"\bsoftware engineering\b", text_lower):
        field = "Software Engineering"
    elif re.search(r"\bdata science\b", text_lower):
        field = "Data Science"
    elif re.search(r"\b(?:information technology|it)\b", text_lower):
        field = "Information Technology"
    elif re.search(r"\belectrical engineering\b", text_lower):
        field = "Electrical Engineering"
    elif re.search(r"\bmathematics|applied math\b", text_lower):
        field = "Mathematics"

    return {
        "degree": degree,
        "field": field,
        "degree_level": level
    }

