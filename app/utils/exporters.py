import io
import pandas as pd
from typing import List
from app.schemas.match import RankingItem


def export_rankings_to_csv(job_title: str, rankings: List[RankingItem]) -> str:
    """
    Exports a list of ranked candidates to CSV format using pandas.
    """
    rows = []
    for item in rankings:
        rows.append({
            "Rank": item.rank,
            "Candidate Name": item.candidate_name,
            "Email": item.candidate_email or "N/A",
            "Phone": item.candidate_phone or "N/A",
            "Final Score (%)": item.final_score,
            "Keyword Score (%)": item.keyword_score,
            "TF-IDF Similarity (%)": item.tfidf_score,
            "Matched Required Skills": ", ".join(item.matched_skills),
            "Missing Required Skills": ", ".join(item.missing_skills),
            "Preferred Skills Matched": ", ".join(item.preferred_matched_skills),
            "Processing Status": item.processing_status,
            "Applied Date": item.applied_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)
