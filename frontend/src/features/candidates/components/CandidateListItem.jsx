function displayStage(stage) {
  return stage === 'Interview' ? 'Interviewing' : stage || 'New';
}

function getInitials(name = '') {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'C';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function CandidateListItem({
  candidate,
  index,
  selected,
  compared,
  breakdown,
  onSelect,
  onToggleCompare,
}) {
  const stage = displayStage(candidate.review_stage);
  const name = candidate.candidate_name || 'Candidate';
  const initials = getInitials(name);
  const rank = candidate.rank || index + 1;
  const score = Number(breakdown.finalScore || 0).toFixed(1);

  return (
    <div
      className={`rounded-[14px] border transition-colors ${
        selected
          ? 'border-line bg-surface-alt shadow-[inset_3px_0_0_0_var(--color-primary)]'
          : 'border-line bg-surface hover:bg-surface-alt/70'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-selected={selected}
        className="flex w-full cursor-pointer items-center gap-3 p-3 text-left select-none"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/60 bg-surface-alt text-[13px] font-semibold text-ink">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-ink">{name}</div>
          <div className="truncate text-[13px] text-ink-muted">
            {stage} · #{rank}
          </div>
        </div>
        <div className="ml-auto shrink-0 text-[14px] font-semibold tabular-nums text-ink">
          {score}%
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-line/50 px-3 py-1.5 text-[11px] text-ink-muted">
        <label className="flex cursor-pointer items-center gap-1.5 select-none">
          <input
            type="checkbox"
            checked={compared}
            onChange={onToggleCompare}
            onClick={(event) => event.stopPropagation()}
            className="rounded accent-primary"
            aria-label={`Add ${name} to comparison`}
          />
          <span>Compare candidate</span>
        </label>
        {compared && <span className="font-medium text-primary">Selected</span>}
      </div>
    </div>
  );
}
