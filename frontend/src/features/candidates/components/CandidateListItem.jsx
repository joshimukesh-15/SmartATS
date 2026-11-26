import { normalizeStage, displayName } from '../constants';

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
  breakdown = {},
  onSelect,
  onToggleCompare,
  anySelected = false,
}) {
  const stage = normalizeStage(candidate.review_stage);
  const cleanName = displayName(candidate.candidate_name);
  const initials = getInitials(cleanName);
  const rank = candidate.rank || index + 1;
  const score = Number(breakdown.finalScore || candidate.final_score || 0).toFixed(1);

  return (
    <div
      className={`group relative flex h-14 min-h-[56px] max-h-[56px] w-full items-center gap-2.5 rounded-[10px] border px-3 transition-colors ${
        selected
          ? 'border-primary/60 dark:border-ice-cyan/60 bg-surface-alt shadow-[inset_3px_0_0_0_var(--primary)]'
          : 'border-line bg-surface hover:bg-surface-alt/70 hover:border-cadet-steel/40'
      }`}
    >
      <div
        className={`shrink-0 transition-opacity ${
          compared || anySelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <input
          type="checkbox"
          checked={Boolean(compared)}
          onChange={onToggleCompare}
          className="h-4 w-4 cursor-pointer rounded border-line accent-primary"
          aria-label={`Add ${cleanName} to comparison`}
        />
      </div>

      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left select-none"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/60 bg-surface-alt text-[13px] font-semibold text-ink">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-ink leading-tight">{cleanName}</div>
          <div className="truncate text-[13px] text-ink-muted leading-tight flex items-center gap-1.5">
            <span>{stage}</span>
            <span>·</span>
            <span className={Number(rank) === 1 ? 'font-semibold text-amber-gold dark:text-silk-cream' : ''}>
              #{rank}
            </span>
          </div>
        </div>
        <div className="ml-auto shrink-0 text-[14px] font-semibold tabular-nums text-ink">
          {score}%
        </div>
      </button>
    </div>
  );
}
