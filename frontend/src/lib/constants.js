export const WEIGHT_SKILLS = 0.40;
export const WEIGHT_TEXT = 0.20;
export const WEIGHT_EXPERIENCE = 0.25;
export const WEIGHT_EDUCATION = 0.15;

export const DEFAULT_WEIGHTS = {
  skills: 0.40,
  text: 0.20,
  experience: 0.25,
  education: 0.15,
};

export const DEFAULT_FORMULA_DESCRIPTION =
  'Final Score = (Skills % × 0.40) + (Semantic Text % × 0.20) + (Experience Fit % × 0.25) + (Education % × 0.15)';

export const WEIGHT_KEYWORD = 0.40;
export const WEIGHT_TFIDF = 0.20;

export const ROUTES = {
  HOME: '/',
  STUDIO: '/studio',
  OVERVIEW: '/studio',
  JOBS: '/studio/jobs',
  UPLOAD: '/studio/upload',
  LEADERBOARD: '/studio/leaderboard',
  COMPARE: '/studio/compare',
  ANALYTICS: '/studio/analytics',
};

export const STORAGE_KEYS = {
  THEME: 'smartats_theme',
  SELECTED_JOB_ID: 'smartats_selected_job_id',
  SORT_CONFIG: 'smartats_sort_config',
};
