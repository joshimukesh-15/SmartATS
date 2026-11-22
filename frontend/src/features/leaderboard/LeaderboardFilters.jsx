import { Link } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { Input } from '../../components/ui';
import { STAGES } from '../candidates';

export default function LeaderboardFilters({
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  rawCandidates = [],
  activeJobId,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-[14px] border border-line bg-surface p-3 shadow-xs sm:p-4 xl:shrink-0 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_auto] xl:items-center xl:gap-4 xl:p-3">
      {/* Left: Search input */}
      <div className="w-full min-w-0">
        <Input
          placeholder="Search candidates or skills..."
          leftIcon={<Search className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Center: Stage Filter Pills */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 xl:gap-1">
        <span className="mr-1 shrink-0 text-[12px] font-medium text-ink-muted">Stage</span>
        {['All', ...STAGES].map((stg) => {
          const isSelected =
            stageFilter === stg || (stageFilter === 'Interview' && stg === 'Interviewing');
          const count =
            stg === 'All'
              ? rawCandidates.length
              : rawCandidates.filter((c) => {
                  const stage = c.review_stage || 'New';
                  if (stage === stg) return true;
                  if (stg === 'Interviewing' && stage === 'Interview') return true;
                  if (stg === 'Interview' && stage === 'Interviewing') return true;
                  return false;
                }).length;
          return (
            <button
              key={stg}
              type="button"
              onClick={() => setStageFilter(stg)}
              className={`shrink-0 rounded-[8px] border px-2.5 py-1.5 text-[12px] transition-colors cursor-pointer xl:px-2.5 ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary font-medium'
                  : 'bg-surface border-line text-ink-muted hover:text-ink hover:bg-surface-alt'
              }`}
            >
              <span>{stg}</span>
              <span className="ml-1 tabular-nums opacity-75">
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Primary review action */}
      <div className="flex items-center xl:justify-end">
        <Link
          to={`/studio/candidates?jobId=${encodeURIComponent(activeJobId || '')}`}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface-alt"
        >
          <UserCheck className="w-4 h-4 text-champagne" strokeWidth={1.75} />
          <span>Review</span>
        </Link>
      </div>
    </div>
  );
}
