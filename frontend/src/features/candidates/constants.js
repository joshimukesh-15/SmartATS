import { DEFAULT_WEIGHTS } from '../../lib/constants';

export const STAGES = ['New', 'Reviewing', 'Interviewing', 'Offer', 'Hired', 'Rejected'];

export function normalizeStage(stage) {
  if (!stage) return 'New';
  if (stage === 'Interview') return 'Interviewing';
  const match = STAGES.find((s) => s.toLowerCase() === String(stage).toLowerCase());
  return match || 'New';
}

/**
 * Strips raw filenames, file extensions, and generic phrases like "Resume Updated"
 * to return a clean human candidate display name.
 */
export function displayName(name) {
  if (!name || typeof name !== 'string') return 'Candidate';
  let clean = name.trim();
  // Strip common file extensions (.pdf, .docx, .doc, .rtf, .txt, .odt)
  clean = clean.replace(/\.(pdf|docx?|txt|rtf|odt)$/i, '');
  // Replace underscores and multiple dashes with spaces first so word boundaries work
  clean = clean.replace(/[-_]+/g, ' ');
  // Strip phrases like "Resume Updated", "Resume", "Updated", "CV" case-insensitively
  clean = clean.replace(/\b(resume\s+updated|updated\s+resume|resume|updated|cv|curriculum\s+vitae)\b/gi, '');
  // Remove leading numbers, dates, hashes or symbols (e.g. "12345 ", "2024 ", "#1 ")
  clean = clean.replace(/^[0-9#\s.]+/, '');
  // Collapse whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Candidate';
  // If the string is all lowercase, convert to Title Case
  if (clean === clean.toLowerCase()) {
    clean = clean.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return clean;
}

export const STAGE_CONFIG = {
  New: {
    label: 'New',
    variant: 'default',
    color: 'ink',
    badge: 'bg-surface-alt text-ink-muted border border-line',
    dot: 'bg-ink-muted',
    accent: 'border-ink-muted/30',
  },
  Reviewing: {
    label: 'Reviewing',
    variant: 'champagne',
    color: 'champagne',
    badge: 'bg-champagne-soft text-ink font-medium border border-champagne/40',
    dot: 'bg-champagne',
    accent: 'border-champagne',
  },
  Interviewing: {
    label: 'Interviewing',
    variant: 'primary',
    color: 'primary',
    badge: 'bg-primary/10 text-primary font-semibold border border-primary/30',
    dot: 'bg-primary',
    accent: 'border-primary',
  },
  Interview: {
    label: 'Interviewing',
    variant: 'primary',
    color: 'primary',
    badge: 'bg-primary/10 text-primary font-semibold border border-primary/30',
    dot: 'bg-primary',
    accent: 'border-primary',
  },
  Offer: {
    label: 'Offer',
    variant: 'secondary',
    color: 'champagne',
    badge: 'bg-champagne text-ink font-semibold border border-champagne-deep/30',
    dot: 'bg-champagne-deep',
    accent: 'border-champagne-deep',
  },
  Hired: {
    label: 'Hired',
    variant: 'success',
    color: 'success',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30',
    dot: 'bg-emerald-500',
    accent: 'border-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    variant: 'danger',
    color: 'danger',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 line-through border border-rose-500/30',
    dot: 'bg-rose-500',
    accent: 'border-rose-500',
  },
};

export function getStageConfig(stage) {
  return STAGE_CONFIG[stage] || STAGE_CONFIG.New;
}

export { DEFAULT_WEIGHTS };
