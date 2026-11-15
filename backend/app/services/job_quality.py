import re
from typing import List, Dict, Any, Optional

# Vague buzzwords that weaken job descriptions
VAGUE_BUZZWORDS = [
    (r"\brockstar\b", "rockstar", "Avoid informal buzzwords; specify actual technical requirements and competencies instead."),
    (r"\bninja\b", "ninja", "Avoid informal buzzwords; state specific engineering responsibilities."),
    (r"\bguru\b", "guru", "Specify required years or depth of technical experience rather than ambiguous titles."),
    (r"\bwear many hats\b", "wear many hats", "Signals undefined scope and potential role overload. Outline clear responsibilities."),
    (r"\bwear multiple hats\b", "wear multiple hats", "Signals undefined role scope. Clearly list cross-functional expectations."),
    (r"\bfast[- ]paced environment\b", "fast-paced environment", "Often perceived as shorthand for unmanaged burnout. Specify delivery cadence and team process."),
    (r"\bwork hard[,\s]+play hard\b", "work hard play hard", "Cliché phrasing that deters applicants seeking healthy work-life balance."),
    (r"\bself[- ]starter with (?:a )?passion\b", "self-starter with passion", "Vague expectation. Detail how mentorship, autonomy, and goal-setting operate."),
    (r"\bhit the ground running\b", "hit the ground running", "May signal lack of onboarding. Clarify ramp-up period and training support."),
    (r"\bdo whatever it takes\b", "do whatever it takes", "Suggests boundary issues. Emphasize teamwork and realistic project milestones."),
    (r"\bunpaid overtime\b", "unpaid overtime", "Raises compliance red flags. Clarify standard working hours and overtime policy."),
    (r"\bhigh[- ]stress environment\b", "high-stress environment", "Clarify support systems, psychological safety, and realistic sprint cycles."),
]

# Unnecessarily restrictive wording & biased language
RESTRICTIVE_PATTERNS = [
    (r"\b(?:top[- ]tier|ivy league)\s+(?:university|college|degree)\b", "Ivy League / Top-tier degree only", "Restrictive credential bias. Consider 'Degree in Computer Science or equivalent practical industry experience'."),
    (r"\bmust have (?:a )?(?:cs|computer science) degree only\b", "Strict CS degree only", "Filters out strong self-taught and bootcamp-trained engineers with equivalent production records."),
    (r"\bstrict gpa\s*(?:>|above|of)?\s*(?:3\.[5-9]|4\.0)\b", "Strict GPA cutoff", "Academic GPA correlates poorly with practical software engineering productivity."),
    (r"\byoung and energetic\b", "young and energetic", "Age-coded language that risks age discrimination. Focus on vitality and enthusiasm for the technology."),
    (r"\bdigital native\b", "digital native", "Age-coded phrase. State the specific software and platforms candidates will work with."),
    (r"\brecent college graduate(?:s)? only\b", "Recent college graduates only", "Potentially age-discriminatory unless explicitly structured as a licensed university co-op/intern program."),
    (r"\bfluent in native english\b", "Native English only", "Language discrimination risk. Specify 'Professional working proficiency in English'."),
]

# Salary detection regexes
SALARY_PATTERNS = [
    re.compile(r"[\$€£₹]\s*\d{2,3}(?:[,\.]\d{3})*(?:\s*[-–—to]+\s*[\$€£₹]?\s*\d{2,3}(?:[,\.]\d{3})*)?", re.IGNORECASE),
    re.compile(r"\b\d{2,3}\s*[kK]\s*[-–—to]+\s*\d{2,3}\s*[kK]\b", re.IGNORECASE),
    re.compile(r"\b(?:salary|compensation|pay rate|package)\s*(?::|is)?\s*[\$€£₹]?\s*\d+", re.IGNORECASE),
    re.compile(r"\b\d{2,3}(?:,\d{3})?\s*(?:usd|eur|gbp|inr)\b", re.IGNORECASE),
]

# Location & Workplace policy detection
LOCATION_PATTERNS = [
    re.compile(r"\b(?:remote|hybrid|on[- ]site|onsite|work from home|wfh)\b", re.IGNORECASE),
    re.compile(r"\b(?:location|office|headquarters|based in|relocation)\s*:\s*[a-zA-Z\s,]+", re.IGNORECASE),
    re.compile(r"\b(?:san francisco|new york|austin|seattle|london|berlin|bangalore|singapore|toronto)\b", re.IGNORECASE),
]

# Employment type detection
EMPLOYMENT_TYPE_PATTERNS = [
    re.compile(r"\b(?:full[- ]time|part[- ]time|contract(?:or)?|internship|freelance|permanent|c2c|w2)\b", re.IGNORECASE),
]


def check_job_description_quality(
    title: str,
    description: str,
    required_skills: List[str] = None,
    preferred_skills: List[str] = None
) -> Dict[str, Any]:
    """
    Evaluates a job posting for completeness, vagueness, and restrictive barriers.
    Returns an objective health score (0-100) and actionable improvement issues.
    """
    required_skills = required_skills or []
    preferred_skills = preferred_skills or []
    combined_text = f"{title}\n\n{description}\n\nRequired: {' '.join(required_skills)}\nPreferred: {' '.join(preferred_skills)}"
    
    words = combined_text.split()
    word_count = len(words)
    desc_words = len(description.split())

    issues = []
    deductions = 0

    # 1. Salary / Compensation Check
    has_explicit_salary = any(pat.search(combined_text) for pat in SALARY_PATTERNS)
    has_vague_salary = bool(re.search(r"\bcompetitive\s+(?:salary|compensation|package)\b", combined_text, re.IGNORECASE))

    if not has_explicit_salary:
        if has_vague_salary:
            deductions += 10
            issues.append({
                "category": "missing_info",
                "severity": "warning",
                "title": "Vague Compensation Statement",
                "message": "'Competitive salary' lacks actionable transparency for candidates.",
                "suggestion": "Specify an explicit salary band (e.g. '$130,000 – $155,000 USD / year'). Listings with transparent salary receive up to 60% more qualified applicants.",
                "detected_text": "competitive salary"
            })
        else:
            deductions += 20
            issues.append({
                "category": "missing_info",
                "severity": "critical",
                "title": "Missing Salary / Compensation Details",
                "message": "No salary range, hourly rate, or compensation band was found.",
                "suggestion": "Provide a salary range (e.g. '$120,000 – $145,000 / year' or '$70 – $90 / hr') to comply with pay transparency expectations.",
                "detected_text": None
            })

    # 2. Location & Workplace Policy Check
    has_location = any(pat.search(combined_text) for pat in LOCATION_PATTERNS)
    if not has_location:
        deductions += 15
        issues.append({
            "category": "missing_info",
            "severity": "warning",
            "title": "Missing Workplace Policy & Location",
            "message": "No work arrangement (Remote, Hybrid, or On-site city) was identified.",
            "suggestion": "Clarify workplace policy clearly (e.g. 'Remote (US/Canada)', 'Hybrid (2 days in San Francisco)', or 'On-site in Austin, TX').",
            "detected_text": None
        })

    # 3. Employment Type Check
    has_employment_type = any(pat.search(combined_text) for pat in EMPLOYMENT_TYPE_PATTERNS)
    if not has_employment_type:
        deductions += 5
        issues.append({
            "category": "missing_info",
            "severity": "suggestion",
            "title": "Employment Type Not Explicit",
            "message": "It is unclear whether this role is Full-time, Contract, or Part-time.",
            "suggestion": "State the contract type (e.g. 'Full-time Permanent' or '6-Month Contract').",
            "detected_text": None
        })

    # 4. Vague Buzzwords Check
    for pattern, phrase, advice in VAGUE_BUZZWORDS:
        match = re.search(pattern, combined_text, re.IGNORECASE)
        if match:
            deductions += 5
            issues.append({
                "category": "vague_requirements",
                "severity": "warning",
                "title": f"Vague Term: '{phrase}'",
                "message": f"Found cliché or vague descriptor '{match.group(0)}'.",
                "suggestion": advice,
                "detected_text": match.group(0)
            })

    # 5. Restrictive Wording & Bias Check
    for pattern, label, advice in RESTRICTIVE_PATTERNS:
        match = re.search(pattern, combined_text, re.IGNORECASE)
        if match:
            deductions += 10
            issues.append({
                "category": "restrictive_wording",
                "severity": "critical",
                "title": f"Restrictive Gate: {label}",
                "message": f"Found exclusionary gate '{match.group(0)}'.",
                "suggestion": advice,
                "detected_text": match.group(0)
            })

    # 6. Excessive Required Skills Checklist Check
    if len(required_skills) > 8:
        excess_count = len(required_skills)
        deductions += 10
        issues.append({
            "category": "restrictive_wording",
            "severity": "warning",
            "title": f"Excessive Mandatory Skills Checklist ({excess_count} skills)",
            "message": f"Listing {excess_count} mandatory skills creates an intimidating laundry list that discourages strong candidates.",
            "suggestion": "Keep mandatory requirements to 4-6 core technologies. Move secondary tools into preferred/nice-to-have skills.",
            "detected_text": f"{excess_count} required skills specified"
        })

    # 7. Description Length Check
    if desc_words < 60:
        deductions += 15
        issues.append({
            "category": "missing_info",
            "severity": "critical",
            "title": "Job Description Is Too Brief",
            "message": f"Description contains only {desc_words} words. Candidates need context on projects, team structure, and impact.",
            "suggestion": "Expand description to at least 150 words covering role impact, day-to-day responsibilities, and team culture.",
            "detected_text": f"{desc_words} words"
        })
    elif desc_words > 900:
        deductions += 5
        issues.append({
            "category": "vague_requirements",
            "severity": "suggestion",
            "title": "Lengthy Job Description",
            "message": f"Description is {desc_words} words. Overly verbose listings experience candidate drop-off before reaching requirements.",
            "suggestion": "Consider tightening paragraphs into scannable bullet points around 300–600 words.",
            "detected_text": f"{desc_words} words"
        })

    # Compute overall score
    final_score = max(10, min(100, 100 - deductions))

    if final_score >= 85:
        grade = "EXCELLENT"
        summary = "Well-balanced, transparent job description with clear expectations and minimal bias."
    elif final_score >= 70:
        grade = "GOOD"
        summary = "Solid posting with minor areas for improvement in compensation transparency or wording."
    elif final_score >= 50:
        grade = "NEEDS_IMPROVEMENT"
        summary = "Several vague requirements or missing transparency elements detected. Refinement recommended."
    else:
        grade = "POOR"
        summary = "Significant issues detected: missing compensation/location or overly restrictive barriers."

    return {
        "overall_score": final_score,
        "grade": grade,
        "summary": summary,
        "word_count": word_count,
        "has_salary": has_explicit_salary,
        "has_location": has_location,
        "has_employment_type": has_employment_type,
        "required_skills_count": len(required_skills),
        "issues": issues,
        "metrics": {
            "deductions": deductions,
            "vague_terms_count": len([i for i in issues if i["category"] == "vague_requirements"]),
            "restrictive_count": len([i for i in issues if i["category"] == "restrictive_wording"]),
            "missing_info_count": len([i for i in issues if i["category"] == "missing_info"])
        }
    }
