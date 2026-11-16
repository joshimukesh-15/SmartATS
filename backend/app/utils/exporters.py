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
        comp_s = item.components.get("skills", {}) if item.components else {}
        comp_t = item.components.get("text", {}) if item.components else {}
        comp_x = item.components.get("experience", {}) if item.components else {}
        comp_e = item.components.get("education", {}) if item.components else {}

        skills_pct = float(comp_s.get("percentage", item.keyword_score))
        skills_weight = float(comp_s.get("weight", item.weights.get("skills", 0.40) if item.weights else 0.40))
        skills_points = float(comp_s.get("points", round(skills_pct * skills_weight, 2)))

        text_pct = float(comp_t.get("percentage", item.tfidf_score))
        text_weight = float(comp_t.get("weight", item.weights.get("text", 0.20) if item.weights else 0.20))
        text_points = float(comp_t.get("points", round(text_pct * text_weight, 2)))

        exp_pct = float(comp_x.get("percentage", item.experience_score or 0.0))
        exp_weight = float(comp_x.get("weight", item.weights.get("experience", 0.25) if item.weights else 0.25))
        exp_points = float(comp_x.get("points", round(exp_pct * exp_weight, 2)))

        edu_pct = float(comp_e.get("percentage", item.education_score or 0.0))
        edu_weight = float(comp_e.get("weight", item.weights.get("education", 0.15) if item.weights else 0.15))
        edu_points = float(comp_e.get("points", round(edu_pct * edu_weight, 2)))

        applied_date_str = item.applied_at.strftime("%Y-%m-%d %H:%M:%S") if item.applied_at else ""

        rows.append({
            "Rank": item.rank,
            "Candidate Name": sanitize_csv_cell(item.candidate_name),
            "Email": sanitize_csv_cell(item.candidate_email or "N/A"),
            "Phone": sanitize_csv_cell(item.candidate_phone or "N/A"),
            "Final Score (%)": item.final_score,
            "Final Score": item.final_score,
            "Skills %": skills_pct,
            "Skills Weight": skills_weight,
            "Skills Points": skills_points,
            "Text %": text_pct,
            "Text Weight": text_weight,
            "Text Points": text_points,
            "Experience %": exp_pct,
            "Experience Weight": exp_weight,
            "Experience Points": exp_points,
            "Education %": edu_pct,
            "Education Weight": edu_weight,
            "Education Points": edu_points,
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
            "Applied Date": applied_date_str
        })

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)
