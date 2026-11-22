export function StatusBadge({ status, size = 'sm', className = '' }) {
  if (!status) return null;

  const normalized = String(status).trim();
  const upper = normalized.toUpperCase();

  const isReScoring = upper === 'RE-SCORING' || normalized === 'Re-scoring';
  const isProcessing = upper === 'PROCESSING';
  const isPending = upper === 'PENDING';
  const isCompleted = upper === 'COMPLETED';
  const isFailed = upper === 'FAILED';
  const isDuplicate = upper === 'DUPLICATE';

  let label = normalized;
  let badgeStyle = 'bg-surface-alt text-ink border border-line';
  let dotStyle = 'bg-ink-muted';
  let showPulse = false;

  if (isReScoring) {
    label = 'Re-scoring';
    badgeStyle = 'bg-champagne-soft text-ink border border-champagne/30';
    dotStyle = 'bg-champagne';
    showPulse = true;
  } else if (isProcessing) {
    label = 'Processing';
    badgeStyle = 'bg-champagne-soft text-ink border border-champagne/30';
    dotStyle = 'bg-champagne';
    showPulse = true;
  } else if (isPending) {
    label = 'Pending';
    badgeStyle = 'bg-surface-alt text-ink-muted border border-line';
    dotStyle = 'bg-ink-muted';
  } else if (isCompleted) {
    label = 'Completed';
    badgeStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
    dotStyle = 'bg-emerald-500';
  } else if (isFailed) {
    label = 'Failed';
    badgeStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30';
    dotStyle = 'bg-rose-500';
  } else if (isDuplicate) {
    label = 'Duplicate';
    badgeStyle = 'bg-surface-alt text-ink-muted border border-line';
    dotStyle = 'bg-ink-subtle';
  }

  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-[13px]' : 'px-2 py-0.5 text-[13px]';

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center gap-1.5 rounded-[8px] font-medium select-none ${sizeClass} ${badgeStyle} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle} ${showPulse ? 'animate-pulse' : ''}`}
      />
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
