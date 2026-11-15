import io
from typing import List, Any
import pandas as pd
from app.schemas.match import RankingItem


def sanitize_csv_cell(value: Any) -> Any:
    """
    Sanitizes values against CSV Formula Injection according to OWASP guidelines.
    Prefixes values starting with '=', '+', '-', '@', horizontal tab, or carriage return with a single quote.
    """
    if value is None:
        return ""
    if isinstance(value, (int, float, bool)):
        return value
    s = str(value).strip()
    if s and s[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{s}"
    return s


def export_rankings_to_csv(job_title: str, rankings: List[RankingItem]) -> str:
    """
    Exports a list of ranked candidates to CSV format using pandas with strict formula-injection sanitization.
    """
    rows = []
    for item in rankings:
        rows.append({
            "Rank": item.rank,
            "Candidate Name": sanitize_csv_cell(item.candidate_name),
            "Email": sanitize_csv_cell(item.candidate_email or "N/A"),
            "Phone": sanitize_csv_cell(item.candidate_phone or "N/A"),
            "Final Score (%)": item.final_score,
            "Keyword Score (%)": item.keyword_score,
            "TF-IDF Similarity (%)": item.tfidf_score,
            "Experience Score (%)": item.experience_score or 0.0,
            "Education Score (%)": item.education_score or 0.0,
            "Experience Years": item.experience_years or 0.0,
            "Seniority Tier": sanitize_csv_cell(item.seniority_level or "Junior / Entry"),
            "Education Credential": sanitize_csv_cell(item.education_level or "Unspecified"),
            "Matched Required Skills": sanitize_csv_cell(", ".join(item.matched_skills)),
            "Missing Required Skills": sanitize_csv_cell(", ".join(item.missing_skills)),
            "Preferred Skills Matched": sanitize_csv_cell(", ".join(item.preferred_matched_skills)),
            "Review Stage": sanitize_csv_cell(item.review_stage),
            "Processing Status": sanitize_csv_cell(item.processing_status),
            "Applied Date": item.applied_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)
