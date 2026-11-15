import { WEIGHT_KEYWORD, WEIGHT_TFIDF } from './constants';

/**
 * Format numeric score with specified decimals.
 * Handles both 0..1 ratio and 0..100 percentage numbers.
 */
export function formatScore(score, decimals = 1) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) {
    return '0.0%';
  }
  const num = Number(score);
  // If score is normalized between 0 and 1, scale to 100
  const normalized = num <= 1 && num > 0 ? num * 100 : num;
  return `${normalized.toFixed(decimals)}%`;
}

/**
 * Calculate skill coverage stats between matched and required skills.
 */
export function getSkillCoverage(matchedSkills = [], requiredSkills = []) {
  const matched = Array.isArray(matchedSkills) ? matchedSkills : [];
  const required = Array.isArray(requiredSkills) ? requiredSkills : [];

  if (required.length === 0) {
    return {
      count: matched.length,
      total: 0,
      ratio: matched.length > 0 ? 1 : 0,
      percentage: matched.length > 0 ? 100 : 0,
    };
  }

  const normalizedMatched = new Set(matched.map((s) => String(s).toLowerCase().trim()));
  const coveredCount = required.filter((s) =>
    normalizedMatched.has(String(s).toLowerCase().trim())
  ).length;

  const ratio = coveredCount / required.length;
  const percentage = ratio * 100;

  return {
    count: coveredCount,
    total: required.length,
    ratio,
    percentage,
  };
}

/**
 * Compute explainability breakdown for candidates.
 * Supports both:
 * - 4-Factor Multi-Pillar Matching: Skills (w_skills) + Text (w_text) + Experience (w_exp) + Education (w_edu)
 * - 2-Factor Dual-Track Legacy/Default: 0.6 x Skills Covered % + 0.4 x Text Match %
 */
export function computeBreakdown(candidate = {}, job = {}) {
  const requiredSkills = job.required_skills || candidate.required_skills || [];
  const matchedSkills = candidate.matched_skills || [];
  const missingSkills = candidate.missing_skills || [];
  const equivalentSkills = candidate.equivalent_skills || {};

  const coverage = getSkillCoverage(matchedSkills, requiredSkills);

  // Normalize text match / tfidf score
  let textMatchPercent = 0;
  if (candidate.tfidf_score !== undefined && candidate.tfidf_score !== null) {
    const rawTfidf = Number(candidate.tfidf_score);
    textMatchPercent = rawTfidf <= 1 ? rawTfidf * 100 : rawTfidf;
  } else if (candidate.text_match !== undefined && candidate.text_match !== null) {
    const rawMatch = Number(candidate.text_match);
    textMatchPercent = rawMatch <= 1 ? rawMatch * 100 : rawMatch;
  }

  const skillsCoveredPercent =
    candidate.keyword_score !== undefined && candidate.keyword_score !== null
      ? Number(candidate.keyword_score) <= 1
        ? Number(candidate.keyword_score) * 100
        : Number(candidate.keyword_score)
      : coverage.percentage;

  // Check if candidate has multi-pillar breakdown from backend
  const breakdown = candidate.score_breakdown || null;
  const hasMultiPillar = Boolean(
    breakdown ||
    candidate.experience_score !== undefined ||
    candidate.education_score !== undefined
  );

  let experiencePercent = 0;
  if (candidate.experience_score !== undefined && candidate.experience_score !== null) {
    const rawExp = Number(candidate.experience_score);
    experiencePercent = rawExp <= 1 ? rawExp * 100 : rawExp;
  } else if (breakdown?.experience !== undefined) {
    const rawExp = Number(breakdown.experience);
    experiencePercent = rawExp <= 1 ? rawExp * 100 : rawExp;
  }

  let educationPercent = 0;
  if (candidate.education_score !== undefined && candidate.education_score !== null) {
    const rawEdu = Number(candidate.education_score);
    educationPercent = rawEdu <= 1 ? rawEdu * 100 : rawEdu;
  } else if (breakdown?.education !== undefined) {
    const rawEdu = Number(breakdown.education);
    educationPercent = rawEdu <= 1 ? rawEdu * 100 : rawEdu;
  }

  const wSkills = breakdown?.weight_skills !== undefined
    ? Number(breakdown.weight_skills)
    : hasMultiPillar
      ? 0.40
      : WEIGHT_KEYWORD;

  const wText = breakdown?.weight_text !== undefined
    ? Number(breakdown.weight_text)
    : hasMultiPillar
      ? 0.20
      : WEIGHT_TFIDF;

  const wExp = breakdown?.weight_experience !== undefined
    ? Number(breakdown.weight_experience)
    : hasMultiPillar
      ? 0.25
      : 0;

  const wEdu = breakdown?.weight_education !== undefined
    ? Number(breakdown.weight_education)
    : hasMultiPillar
      ? 0.15
      : 0;

  const skillsCoveredPoints = skillsCoveredPercent * wSkills;
  const textMatchPoints = textMatchPercent * wText;
  const experiencePoints = experiencePercent * wExp;
  const educationPoints = educationPercent * wEdu;

  const calculatedScore =
    skillsCoveredPoints + textMatchPoints + experiencePoints + educationPoints;

  const finalScore =
    candidate.final_score !== undefined &&
    candidate.final_score !== null &&
    (Number(candidate.final_score) > 0 || calculatedScore === 0)
      ? Number(candidate.final_score) <= 1
        ? Number(candidate.final_score) * 100
        : Number(candidate.final_score)
      : calculatedScore;

  const formulaSummary = hasMultiPillar
    ? `Skills ${skillsCoveredPercent.toFixed(1)}% × ${wSkills.toFixed(2)} (${skillsCoveredPoints.toFixed(1)} pts) + Text ${textMatchPercent.toFixed(1)}% × ${wText.toFixed(2)} (${textMatchPoints.toFixed(1)} pts) + Exp ${experiencePercent.toFixed(1)}% × ${wExp.toFixed(2)} (${experiencePoints.toFixed(1)} pts) + Edu ${educationPercent.toFixed(1)}% × ${wEdu.toFixed(2)} (${educationPoints.toFixed(1)} pts)`
    : `Skills covered ${skillsCoveredPercent.toFixed(1)}% × 0.6 = ${skillsCoveredPoints.toFixed(1)} pts + Text match ${textMatchPercent.toFixed(1)}% × 0.4 = ${textMatchPoints.toFixed(1)} pts`;

  return {
    hasMultiPillar,
    skillsCoveredCount: coverage.count,
    skillsRequiredCount: coverage.total,
    skillsCoveredRatio: coverage.ratio,
    skillsCoveredPercent,
    skillsCoveredPoints,
    textMatchPercent,
    textMatchPoints,
    experiencePercent,
    experiencePoints,
    educationPercent,
    educationPoints,
    weightSkills: wSkills,
    weightText: wText,
    weightExperience: wExp,
    weightEducation: wEdu,
    finalScore,
    matchedSkills,
    missingSkills,
    equivalentSkills,
    experienceYears: candidate.experience_years,
    seniorityLevel: candidate.seniority_level,
    educationLevel: candidate.education_level,
    formulaSummary,
  };
}

/**
 * Stable sorting helper for candidates.
 */
export function sortCandidates(candidates = [], sortBy = 'score', sortOrder = 'desc') {
  if (!Array.isArray(candidates)) return [];
  const list = [...candidates];
  const orderFactor = sortOrder === 'asc' ? 1 : -1;

  return list.sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = Number(a.final_score ?? a.score ?? 0);
      const scoreB = Number(b.final_score ?? b.score ?? 0);
      return (scoreA - scoreB) * orderFactor;
    }
    if (sortBy === 'name') {
      const nameA = String(a.name || a.candidate_name || '').toLowerCase();
      const nameB = String(b.name || b.candidate_name || '').toLowerCase();
      return nameA.localeCompare(nameB) * orderFactor;
    }
    if (sortBy === 'skills') {
      const skillsA = Number(a.keyword_score ?? (a.matched_skills?.length || 0));
      const skillsB = Number(b.keyword_score ?? (b.matched_skills?.length || 0));
      return (skillsA - skillsB) * orderFactor;
    }
    if (sortBy === 'textMatch') {
      const matchA = Number(a.tfidf_score ?? a.text_match ?? 0);
      const matchB = Number(b.tfidf_score ?? b.text_match ?? 0);
      return (matchA - matchB) * orderFactor;
    }
    return 0;
  });
}
