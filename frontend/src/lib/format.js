/**
 * Formatting utilities for SmartATS.
 */

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0.0%';
  }
  const num = Number(value);
  const normalized = num <= 1 && num > 0 ? num * 100 : num;
  return `${normalized.toFixed(decimals)}%`;
}

export function formatNumber(num) {
  if (num === null || num === undefined || Number.isNaN(Number(num))) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(Number(num));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

/**
 * Clean candidate names: strips resume, cv, updated, final, draft, copy, hashes, and extensions.
 */
export function cleanCandidateName(rawName) {
  if (!rawName) return 'Unnamed Candidate';
  let cleaned = String(rawName).trim();

  // Strip file extensions
  cleaned = cleaned.replace(/\.(pdf|docx|doc|txt)$/i, '');

  // Strip typical artifact suffixes and hashes
  cleaned = cleaned.replace(/[-_]?[0-9a-f]{6,12}$/i, '');
  cleaned = cleaned.replace(
    /\b(resume|cv|updated|final|v\d+|draft|copy|new|latest|clean|formatted)\b/gi,
    ''
  );

  // Replace underscores and multiple dashes with spaces
  cleaned = cleaned.replace(/[_-]+/g, ' ');

  // Clean trailing punctuation and normalize spaces
  cleaned = cleaned
    .replace(/[()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Candidate';

  // Capitalize words
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function truncate(str, max = 40) {
  if (!str) return '';
  if (str.length <= max) return str;
  return `${str.slice(0, max)}…`;
}
