export const STAGES = ['New', 'Reviewing', 'Interview', 'Hired', 'Rejected'];

export const STAGE_CONFIG = {
  New: {
    label: 'New',
    badge: 'bg-surface-alt text-ink-muted border border-line',
  },
  Reviewing: {
    label: 'Reviewing',
    badge: 'bg-champagne-soft text-ink font-medium border border-champagne/40',
  },
  Interview: {
    label: 'Interview',
    badge: 'bg-primary/10 text-primary font-semibold border border-primary/30',
  },
  Hired: {
    label: 'Hired',
    badge: 'bg-champagne text-ink font-semibold',
  },
  Rejected: {
    label: 'Rejected',
    badge: 'bg-surface-alt/60 text-ink-subtle line-through border border-line/60',
  },
};

export const DEFAULT_WEIGHTS = {
  weight_skills: 0.40,
  weight_text: 0.20,
  weight_experience: 0.25,
  weight_education: 0.15,
};
