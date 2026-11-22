import { useMemo } from 'react';

/**
 * Shared StatStrip configuration helpers and hooks.
 * Centralizes definition and formatting for "Processed", "Average score", and "Duplicates blocked".
 */
export function formatStatProcessed(data, options = {}) {
  const value =
    options.value ??
    (data?.totals?.applications ??
      data?.total_processed ??
      data?.processed_resumes ??
      data?.total_applications ??
      0);

  const completed = data?.totals?.completed ?? data?.processed_resumes;
  const defaultCaption =
    completed !== undefined
      ? `${completed} completed`
      : options.total != null
      ? `${options.total} total ${options.total === 1 ? 'applicant' : 'applicants'}`
      : 'Ingested resumes';

  return {
    label: options.label || 'Processed',
    value,
    caption: options.caption || defaultCaption,
  };
}

export function formatStatAverageScore(data, options = {}) {
  const raw =
    options.score ??
    (data?.average_score ??
      data?.average_final_score ??
      data?.avg_final_score ??
      0);
  const num = Number(raw) || 0;

  return {
    label: options.label || 'Average Score',
    value: `${num.toFixed(1)}%`,
    caption: options.caption || 'Composite candidate fit',
  };
}

export function formatStatDuplicatesBlocked(data, options = {}) {
  const count =
    options.count ??
    (data?.totals?.duplicates_blocked ??
      data?.duplicate_resumes ??
      data?.duplicate_count ??
      0);

  return {
    label: options.label || 'Duplicates Blocked',
    value: count,
    caption: options.caption || 'SHA-256 hash matches',
  };
}

export function useStatStripConfig(data, options = {}) {
  return useMemo(
    () => ({
      processed: formatStatProcessed(data, options.processed),
      averageScore: formatStatAverageScore(data, options.averageScore),
      duplicatesBlocked: formatStatDuplicatesBlocked(data, options.duplicatesBlocked),
    }),
    [data, options]
  );
}
