import { DEFAULT_WEIGHTS } from './constants';

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
 * Supports:
 * - 4-Factor Multi-Pillar Matching: Skills (w_skills) + Text (w_text) + Experience (w_exp) + Education (w_edu)
 * - Directly reads candidate.components, candidate.weights, and candidate.score_breakdown when available.
 */
function resolveWeight(comp, weights, breakdown, key, fallback) {
  return Number(
    comp?.weight ??
    weights?.[key] ??
    weights?.[`weight_${key}`] ??
    breakdown?.[`weight_${key}`] ??
    breakdown?.[key] ??
    fallback
  );
}

function resolvePercent(candidateScore, breakdownScore, fallback = 0) {
  const val = candidateScore !== undefined && candidateScore !== null ? candidateScore : breakdownScore;
  if (val === undefined || val === null) return fallback;
  const num = Number(val);
  return num <= 1 && num > 0 ? num * 100 : num;
}

export function computeBreakdown(candidate = {}, job = {}) {
  const requiredSkills = job.required_skills || candidate.required_skills || [];
  const matchedSkills = candidate.matched_skills || [];
  const missingSkills = candidate.missing_skills || [];
  const equivalentSkills = candidate.equivalent_skills || {};

  const coverage = getSkillCoverage(matchedSkills, requiredSkills);

  const components = candidate.components || null;
  const weights = candidate.weights || null;
  const breakdown = candidate.score_breakdown || null;

  let skillsCoveredPercent = 0;
  let textMatchPercent = 0;
  let experiencePercent = 0;
  let educationPercent = 0;

  let wSkills = DEFAULT_WEIGHTS.skills;
  let wText = DEFAULT_WEIGHTS.text;
  let wExp = DEFAULT_WEIGHTS.experience;
  let wEdu = DEFAULT_WEIGHTS.education;

  let skillsCoveredPoints = 0;
  let textMatchPoints = 0;
  let experiencePoints = 0;
  let educationPoints = 0;

  if (components) {
    const compSkills = components.skills || {};
    const compText = components.text || {};
    const compExp = components.experience || {};
    const compEdu = components.education || {};

    skillsCoveredPercent = compSkills.percentage !== undefined ? Number(compSkills.percentage) : coverage.percentage;
    textMatchPercent = compText.percentage !== undefined ? Number(compText.percentage) : 0;
    experiencePercent = compExp.percentage !== undefined ? Number(compExp.percentage) : 0;
    educationPercent = compEdu.percentage !== undefined ? Number(compEdu.percentage) : 0;

    wSkills = resolveWeight(compSkills, weights, breakdown, 'skills', DEFAULT_WEIGHTS.skills);
    wText = resolveWeight(compText, weights, breakdown, 'text', DEFAULT_WEIGHTS.text);
    wExp = resolveWeight(compExp, weights, breakdown, 'experience', DEFAULT_WEIGHTS.experience);
    wEdu = resolveWeight(compEdu, weights, breakdown, 'education', DEFAULT_WEIGHTS.education);

    skillsCoveredPoints = compSkills.points !== undefined ? Number(compSkills.points) : Number((skillsCoveredPercent * wSkills).toFixed(2));
    textMatchPoints = compText.points !== undefined ? Number(compText.points) : Number((textMatchPercent * wText).toFixed(2));
    experiencePoints = compExp.points !== undefined ? Number(compExp.points) : Number((experiencePercent * wExp).toFixed(2));
    educationPoints = compEdu.points !== undefined ? Number(compEdu.points) : Number((educationPercent * wEdu).toFixed(2));
  } else {
    const candidateWeights = weights || breakdown || job.custom_weights || {};
    wSkills = resolveWeight(null, candidateWeights, null, 'skills', DEFAULT_WEIGHTS.skills);
    wText = resolveWeight(null, candidateWeights, null, 'text', DEFAULT_WEIGHTS.text);
    wExp = resolveWeight(null, candidateWeights, null, 'experience', DEFAULT_WEIGHTS.experience);
    wEdu = resolveWeight(null, candidateWeights, null, 'education', DEFAULT_WEIGHTS.education);

    skillsCoveredPercent = resolvePercent(candidate.keyword_score, breakdown?.skills, coverage.percentage);
    textMatchPercent = resolvePercent(candidate.tfidf_score ?? candidate.text_match, breakdown?.text, 0);
    experiencePercent = resolvePercent(candidate.experience_score, breakdown?.experience, 0);
    educationPercent = resolvePercent(candidate.education_score, breakdown?.education, 0);

    skillsCoveredPoints = Number((skillsCoveredPercent * wSkills).toFixed(2));
    textMatchPoints = Number((textMatchPercent * wText).toFixed(2));
    experiencePoints = Number((experiencePercent * wExp).toFixed(2));
    educationPoints = Number((educationPercent * wEdu).toFixed(2));
  }

  const hasMultiPillar = Boolean(
    components ||
    breakdown ||
    wExp > 0 ||
    wEdu > 0 ||
    experiencePoints > 0 ||
    educationPoints > 0 ||
    candidate.experience_score !== undefined ||
    candidate.education_score !== undefined
  );

  const calculatedScore = Number(
    (skillsCoveredPoints + textMatchPoints + experiencePoints + educationPoints).toFixed(2)
  );

  const finalScore =
    candidate.final_score !== undefined &&
    candidate.final_score !== null &&
    (Number(candidate.final_score) > 0 || calculatedScore === 0)
      ? Number(candidate.final_score) <= 1 && Number(candidate.final_score) > 0
        ? Number(candidate.final_score) * 100
        : Number(candidate.final_score)
      : calculatedScore;

  const formulaSummary = hasMultiPillar
    ? `Skills ${skillsCoveredPercent.toFixed(1)}% × ${wSkills.toFixed(2)} (${skillsCoveredPoints.toFixed(1)} pts) + Text ${textMatchPercent.toFixed(1)}% × ${wText.toFixed(2)} (${textMatchPoints.toFixed(1)} pts) + Exp ${experiencePercent.toFixed(1)}% × ${wExp.toFixed(2)} (${experiencePoints.toFixed(1)} pts) + Edu ${educationPercent.toFixed(1)}% × ${wEdu.toFixed(2)} (${educationPoints.toFixed(1)} pts)`
    : `Skills covered ${skillsCoveredPercent.toFixed(1)}% × ${wSkills.toFixed(2)} = ${skillsCoveredPoints.toFixed(1)} pts + Text match ${textMatchPercent.toFixed(1)}% × ${wText.toFixed(2)} = ${textMatchPoints.toFixed(1)} pts`;

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
    weights: {
      weight_skills: wSkills,
      weight_text: wText,
      weight_experience: wExp,
      weight_education: wEdu,
      skills: wSkills,
      text: wText,
      experience: wExp,
      education: wEdu,
    },
    components: {
      skills: { percentage: skillsCoveredPercent, weight: wSkills, points: skillsCoveredPoints },
      text: { percentage: textMatchPercent, weight: wText, points: textMatchPoints },
      experience: { percentage: experiencePercent, weight: wExp, points: experiencePoints },
      education: { percentage: educationPercent, weight: wEdu, points: educationPoints },
    },
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
 * Stable sorting helper for candidates supporting score, name, newest, stage, skills, and textMatch.
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
    if (sortBy === 'newest' || sortBy === 'created_at' || sortBy === 'date') {
      const dateA = new Date(a.created_at || a.created_date || 0).getTime() || Number(a.application_id ?? a.id ?? 0);
      const dateB = new Date(b.created_at || b.created_date || 0).getTime() || Number(b.application_id ?? b.id ?? 0);
      return (dateA - dateB) * orderFactor;
    }
    if (sortBy === 'stage') {
      const stageA = String(a.review_stage || 'New').toLowerCase();
      const stageB = String(b.review_stage || 'New').toLowerCase();
      return stageA.localeCompare(stageB) * orderFactor;
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
