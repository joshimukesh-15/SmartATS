import re
from typing import List, Dict, Any, Tuple, Optional
from app.core.config import settings
from app.ml.vectorizer import compute_tfidf_similarity
from app.services.taxonomy import normalize_skill_name, get_equivalent_skill_match
from app.services.extractor import (
    extract_experience_years,
    extract_seniority_level,
    extract_education
)


def evaluate_skill_gaps(
    candidate_skills: List[str],
    required_skills: List[str],
    preferred_skills: List[str]
) -> Tuple[List[str], List[str], List[str]]:
    """
    Normalizes and categorizes candidate skills into:
    - matched_required: required skills possessed by candidate
    - missing_required: required skills candidate is missing
    - matched_preferred: optional preferred skills possessed by candidate
    """
    cand_norm_set = {normalize_skill_name(s).lower() for s in candidate_skills}

    matched_required = []
    missing_required = []
    matched_preferred = []

    for req in required_skills:
        req_norm = normalize_skill_name(req)
        if req_norm.lower() in cand_norm_set:
            matched_required.append(req_norm)
        else:
            missing_required.append(req_norm)

    for pref in preferred_skills:
        pref_norm = normalize_skill_name(pref)
        if pref_norm.lower() in cand_norm_set:
            matched_preferred.append(pref_norm)

    return (
        sorted(list(set(matched_required))),
        sorted(list(set(missing_required))),
        sorted(list(set(matched_preferred)))
    )


def find_equivalent_skill_matches(candidate_skills: List[str], missing_required: List[str]) -> Dict[str, str]:
    """
    Checks missing required skills against candidate's skills for functional equivalents.
    Returns: {required_skill: matched_equivalent_skill}
    """
    eq_matches = {}
    for req in missing_required:
        eq = get_equivalent_skill_match(req, candidate_skills)
        if eq:
            eq_matches[req] = eq
    return eq_matches


def compute_keyword_score(matched_count: int, total_required: int, equivalent_count: int = 0) -> float:
    """
    Computes keyword score as percentage of matched required skills.
    Direct matches receive 100% weight; equivalent family skills receive 75% credit.
    """
    if total_required == 0:
        return 100.0
    effective_count = matched_count + (equivalent_count * 0.75)
    return round(min(100.0, (effective_count / total_required) * 100.0), 2)


def compute_experience_score(exp_years: float, candidate_seniority: str, job_description: str) -> float:
    """
    Evaluates candidate experience years and seniority against the job requirements.
    Supports explicit ranges (e.g. '2 - 4 years experience'), single thresholds ('3+ years'),
    and role-level seniority inference.
    """
    jd_lower = job_description.lower()

    # 1. Check for explicit range in JD (e.g. "2 - 4 years", "2 to 4 years", "between 2 and 4 yrs")
    range_pat = re.compile(
        r"(?:(?:between|from)\s+)?(\d+(?:\.\d+)?)\s*(?:-|–|—|\s+to\s+)\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+\w+){0,3}\s+experience",
        re.IGNORECASE,
    )
    m_range = range_pat.search(jd_lower)

    if m_range:
        try:
            val1 = float(m_range.group(1))
            val2 = float(m_range.group(2))
            min_years = min(val1, val2)
            max_years = max(val1, val2)
        except ValueError:
            min_years, max_years = 2.0, 4.0

        if min_years <= exp_years <= max_years:
            score = 100.0
        elif exp_years > max_years:
            # Within reasonable range above max (e.g. 5-7 yrs for a 2-4 yr role) -> 100%
            # Overqualified senior (> max + 4 yrs) -> 95%
            score = 100.0 if exp_years <= max_years + 4.0 else 95.0
        elif exp_years >= min_years * 0.75:
            score = 85.0
        elif exp_years >= min_years * 0.50:
            score = 65.0
        elif exp_years > 0:
            score = 45.0
        else:
            score = 30.0
    else:
        # 2. Check for explicit single requirement (e.g. "5+ years", "at least 3 years", "minimum 2 years")
        single_pat = re.compile(
            r"(?:(?:at least|min(?:imum)?(?:\s+of)?)\s+)?(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+\w+){0,3}\s+experience",
            re.IGNORECASE,
        )
        m_single = single_pat.search(jd_lower)
        if m_single:
            try:
                target_years = float(m_single.group(1))
            except ValueError:
                target_years = 3.0
        elif re.search(r"\b(?:senior|sr\.?|lead|principal|architect)\b", jd_lower):
            target_years = 5.0
        elif re.search(r"\b(?:junior|entry|intern|associate)\b", jd_lower):
            target_years = 1.0
        else:
            target_years = 3.0

        if exp_years >= target_years:
            score = 100.0
        elif exp_years >= target_years * 0.7:
            score = 85.0
        elif exp_years >= target_years * 0.4:
            score = 65.0
        elif exp_years > 0:
            score = 45.0
        else:
            score = 30.0

    # Boost if candidate seniority matches role seniority
    if "senior" in jd_lower and candidate_seniority in {"Senior", "Lead / Principal"}:
        score = max(score, 90.0)
    elif "lead" in jd_lower and candidate_seniority == "Lead / Principal":
        score = max(score, 95.0)

    return round(score, 2)


def get_required_education_level(job_description: str) -> int:
    """
    Infers mandatory/preferred educational credential level from job description:
    5: PhD / Doctorate
    4: Master's Degree
    3: Bachelor's Degree
    2: Associate Degree / Diploma
    0: No degree requirement stated
    """
    if not job_description:
        return 0

    jd_lower = job_description.lower()
    if re.search(r"\b(?:no degree required|degree not required|degree is not required|without a degree)\b", jd_lower):
        return 0

    if re.search(r"\b(?:ph\.?d|doctorate|doctor of philosophy)\b", jd_lower):
        return 5
    if re.search(r"\b(?:master(?:'s)?|m\.?s\.?|mba|m\.?tech|m\.?eng)\b", jd_lower):
        return 4
    if re.search(r"\b(?:bachelor(?:'s)?|b\.?s\.?|b\.?tech|b\.?e\.?|b\.?a\.?|degree in (?:computer|software|engineering|data|science|math|information)|university degree|college degree)\b", jd_lower):
        return 3
    if re.search(r"\b(?:associate(?:'s)?|diploma)\b", jd_lower):
        return 2

    return 0


def compute_education_score(education: Dict[str, Any], job_description: str) -> float:
    """
    Evaluates candidate academic degree and field relevance against explicit job requirements.
    - If job does not specify or require a degree, candidates are not penalized (100% neutral credit).
    - If candidate meets or exceeds required level, awards 100%.
    - If candidate possesses a lower degree than required, awards proportional credit.
    - If candidate has no detected education and degree is required, awards 0%.
    """
    degree_level = education.get("degree_level", 1) if education else 1
    field = education.get("field") if education else None
    req_level = get_required_education_level(job_description)

    if req_level == 0:
        # Job does not require a formal degree: no penalty for uncredentialed candidates
        score = 100.0
    else:
        # Degree explicitly required by job description
        if degree_level <= 1:
            # Candidate has no degree detected when job requires degree
            score = 0.0
        elif degree_level >= req_level:
            score = 100.0
        elif degree_level == req_level - 1:
            score = 65.0
        elif degree_level == req_level - 2:
            score = 40.0
        else:
            score = 0.0

    # Relevant technical field bonus if candidate has an education record
    if degree_level > 1 and field in {
        "Computer Science", "Software Engineering", "Data Science",
        "Electrical Engineering", "Information Technology", "Mathematics"
    }:
        score = min(100.0, score + 10.0)

    return round(score, 2)


def generate_explanation_2factor(
    candidate_name: str,
    final_score: float,
    keyword_score: float,
    tfidf_score: float,
    matched_required: List[str],
    missing_required: List[str],
    matched_preferred: List[str],
    total_required: int,
    w_keyword: float,
    w_tfidf: float
) -> str:
    explanation_parts = [
        f"Hybrid Score Formula: ({w_keyword:.0%} × Keyword Match) + ({w_tfidf:.0%} × TF-IDF Text Similarity) = "
        f"({w_keyword:.2f} × {keyword_score:.1f}%) + ({w_tfidf:.2f} × {tfidf_score:.1f}%) = {final_score:.1f}%."
    ]
    if total_required > 0:
        explanation_parts.append(
            f"Skill Match: The candidate matched {len(matched_required)} of {total_required} required skills "
            f"({keyword_score:.1f}% keyword coverage)."
        )
    else:
        explanation_parts.append("Skill Match: No mandatory skills were specified for this job.")

    if matched_required:
        explanation_parts.append(f"Matched Required Skills: {', '.join(matched_required)}.")

    if missing_required:
        explanation_parts.append(f"Missing Required Skills: {', '.join(missing_required)}.")
    else:
        explanation_parts.append("Missing Required Skills: None. The candidate satisfies all mandatory skill requirements.")

    if matched_preferred:
        explanation_parts.append(f"Preferred Skills Identified: {', '.join(matched_preferred)}.")

    if tfidf_score >= 60.0:
        explanation_parts.append(f"Contextual Relevance: High vocabulary overlap with job description ({tfidf_score:.1f}% similarity).")
    else:
        explanation_parts.append(f"Contextual Relevance: Moderate vocabulary overlap with job description ({tfidf_score:.1f}% similarity).")

    return "\n\n".join(explanation_parts)


def generate_explanation_4factor(
    candidate_name: str,
    final_score: float,
    keyword_score: float,
    tfidf_score: float,
    experience_score: float,
    education_score: float,
    matched_required: List[str],
    missing_required: List[str],
    equivalent_skills: Dict[str, str],
    matched_preferred: List[str],
    total_required: int,
    experience_years: float,
    seniority_level: str,
    education_degree: str,
    w_keyword: float,
    w_tfidf: float,
    w_exp: float,
    w_edu: float
) -> str:
    explanation_parts = [
        f"Multi-Factor Fit Formula: ({w_keyword:.0%} Skills) + ({w_tfidf:.0%} Text) + "
        f"({w_exp:.0%} Experience) + ({w_edu:.0%} Education) = "
        f"({w_keyword:.2f} × {keyword_score:.1f}%) + ({w_tfidf:.2f} × {tfidf_score:.1f}%) + "
        f"({w_exp:.2f} × {experience_score:.1f}%) + ({w_edu:.2f} × {education_score:.1f}%) = {final_score:.1f}%."
    ]

    if total_required > 0:
        direct_count = len(matched_required)
        eq_count = len(equivalent_skills)
        explanation_parts.append(
            f"Skills Match: {direct_count} direct + {eq_count} equivalent out of {total_required} required skills "
            f"({keyword_score:.1f}% weighted coverage)."
        )
    else:
        explanation_parts.append("Skills Match: No mandatory skills were specified for this job.")

    if matched_required:
        explanation_parts.append(f"Matched Direct Skills: {', '.join(matched_required)}.")

    if equivalent_skills:
        eq_summary = [f"{req} (via {eq})" for req, eq in equivalent_skills.items()]
        explanation_parts.append(f"Equivalent Skills Recognized: {', '.join(eq_summary)}.")

    if missing_required:
        remaining_missing = [s for s in missing_required if s not in equivalent_skills]
        if remaining_missing:
            explanation_parts.append(f"Missing Required Skills: {', '.join(remaining_missing)}.")
    else:
        explanation_parts.append("Missing Required Skills: None. The candidate satisfies all mandatory skill criteria.")

    explanation_parts.append(
        f"Experience & Seniority: {experience_years} years verified ({seniority_level} tier) — {experience_score:.1f}% alignment."
    )
    explanation_parts.append(
        f"Education: {education_degree} — {education_score:.1f}% qualification rating."
    )

    if matched_preferred:
        explanation_parts.append(f"Preferred Skills Identified: {', '.join(matched_preferred)}.")

    return "\n\n".join(explanation_parts)


def run_hybrid_matching(
    resume_text: str,
    candidate_skills: List[str],
    job_description: str,
    required_skills: List[str],
    preferred_skills: List[str],
    candidate_name: str = "Candidate",
    weight_keyword: float = None,
    weight_tfidf: float = None,
    weight_experience: float = None,
    weight_education: float = None
) -> Dict[str, Any]:
    """
    Executes hybrid matching:
    - If 4 weights are provided (or experience/education specified): runs 4-factor multi-factor screening.
    - If only 2 weights (keyword & tfidf) provided: maintains exact 2-factor formula backwards compatibility.
    """
    matched_req, missing_req, matched_pref = evaluate_skill_gaps(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills
    )

    eq_matched = find_equivalent_skill_matches(candidate_skills, missing_req)

    # TF-IDF cosine similarity
    job_full_text = f"{job_description}\n" + " ".join(required_skills) + " " + " ".join(preferred_skills)
    tfidf_score = compute_tfidf_similarity(resume_text, job_full_text)

    # Experience & Education
    exp_years = extract_experience_years(resume_text)
    seniority = extract_seniority_level(resume_text, exp_years)
    experience_score = compute_experience_score(exp_years, seniority, job_description)

    education_data = extract_education(resume_text)
    education_score = compute_education_score(education_data, job_description)

    # Check whether caller explicitly requested 2-factor formula (legacy test compatibility)
    is_explicit_2factor = (
        weight_experience is None
        and weight_education is None
        and weight_keyword is not None
        and weight_tfidf is not None
        and round(weight_keyword + weight_tfidf, 2) == 1.0
    )

    if is_explicit_2factor:
        keyword_score = compute_keyword_score(len(matched_req), len(required_skills), 0)
        final_score = round((weight_keyword * keyword_score) + (weight_tfidf * tfidf_score), 2)
        final_score = max(0.0, min(100.0, final_score))

        explanation = generate_explanation_2factor(
            candidate_name=candidate_name,
            final_score=final_score,
            keyword_score=keyword_score,
            tfidf_score=tfidf_score,
            matched_required=matched_req,
            missing_required=missing_req,
            matched_preferred=matched_pref,
            total_required=len(required_skills),
            w_keyword=weight_keyword,
            w_tfidf=weight_tfidf
        )

        return {
            "keyword_score": keyword_score,
            "tfidf_score": tfidf_score,
            "final_score": final_score,
            "matched_skills": matched_req,
            "missing_skills": missing_req,
            "equivalent_skills": eq_matched,
            "preferred_matched_skills": matched_pref,
            "experience_years": exp_years,
            "seniority_level": seniority,
            "education_level": education_data.get("degree", "Unspecified"),
            "score_explanation": explanation
        }

    # 4-Pillar Multi-Factor Mode
    keyword_score = compute_keyword_score(len(matched_req), len(required_skills), len(eq_matched))

    w_kw = weight_keyword if weight_keyword is not None else 0.40
    w_tfidf = weight_tfidf if weight_tfidf is not None else 0.20
    w_exp = weight_experience if weight_experience is not None else 0.25
    w_edu = weight_education if weight_education is not None else 0.15

    total_w = max(0.01, w_kw + w_tfidf + w_exp + w_edu)
    norm_kw = w_kw / total_w
    norm_tfidf = w_tfidf / total_w
    norm_exp = w_exp / total_w
    norm_edu = w_edu / total_w

    final_score = round(
        (norm_kw * keyword_score)
        + (norm_tfidf * tfidf_score)
        + (norm_exp * experience_score)
        + (norm_edu * education_score),
        2
    )
    final_score = max(0.0, min(100.0, final_score))

    explanation = generate_explanation_4factor(
        candidate_name=candidate_name,
        final_score=final_score,
        keyword_score=keyword_score,
        tfidf_score=tfidf_score,
        experience_score=experience_score,
        education_score=education_score,
        matched_required=matched_req,
        missing_required=missing_req,
        equivalent_skills=eq_matched,
        matched_preferred=matched_pref,
        total_required=len(required_skills),
        experience_years=exp_years,
        seniority_level=seniority,
        education_degree=education_data.get("degree", "Unspecified"),
        w_keyword=norm_kw,
        w_tfidf=norm_tfidf,
        w_exp=norm_exp,
        w_edu=norm_edu
    )

    return {
        "keyword_score": keyword_score,
        "tfidf_score": tfidf_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "final_score": final_score,
        "matched_skills": matched_req,
        "missing_skills": missing_req,
        "equivalent_skills": eq_matched,
        "preferred_matched_skills": matched_pref,
        "experience_years": exp_years,
        "seniority_level": seniority,
        "education_level": education_data.get("degree", "Unspecified"),
        "score_breakdown": {
            "skills": keyword_score,
            "text": tfidf_score,
            "experience": experience_score,
            "education": education_score,
            "weight_skills": norm_kw,
            "weight_text": norm_tfidf,
            "weight_experience": norm_exp,
            "weight_education": norm_edu
        },
        "score_explanation": explanation
    }
