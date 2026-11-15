import { Link } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { Input } from '../../components/ui';
import { STAGES } from './constants';

export default function LeaderboardFilters({
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  rawCandidates = [],
  activeJobId,
  selectedCandidate,
  density = 'comfortable',
  onDensityChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-[14px] bg-surface border border-line shadow-xs">
      {/* Left: Search input */}
      <div className="w-full lg:w-72">
        <Input
          placeholder="Search candidates or skills..."
          leftIcon={<Search className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Center: Stage Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        <span className="text-[13px] text-ink-muted font-medium mr-1 shrink-0">Stage:</span>
        {['All', ...STAGES].map((stg) => {
          const isSelected = stageFilter === stg;
          const count =
            stg === 'All'
              ? rawCandidates.length
              : rawCandidates.filter((c) => (c.review_stage || 'New') === stg).length;
          return (
            <button
              key={stg}
              type="button"
              onClick={() => setStageFilter(stg)}
              className={`px-3 py-1.5 rounded-[8px] text-[13px] border transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary font-medium'
                  : 'bg-surface border-line text-ink-muted hover:text-ink hover:bg-surface-alt'
              }`}
            >
              <span>{stg}</span>
              <span className="ml-1.5 tabular-nums text-[13px] opacity-75">
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Density toggle & Navigation */}
      <div className="flex items-center gap-2.5 text-[13px] text-ink-muted shrink-0 flex-wrap">
        {/* Row density toggle */}
        <div className="flex items-center rounded-[8px] border border-line bg-surface-alt/60 p-0.5 select-none">
          <button
            type="button"
            onClick={() => onDensityChange?.('comfortable')}
            className={`px-2.5 py-1 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer ${
              density === 'comfortable'
                ? 'bg-surface text-ink shadow-xs font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
            title="Comfortable row density (64px)"
          >
            Comfortable
          </button>
          <button
            type="button"
            onClick={() => onDensityChange?.('compact')}
            className={`px-2.5 py-1 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer ${
              density === 'compact'
                ? 'bg-surface text-ink shadow-xs font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
            title="Compact row density (48px)"
          >
            Compact
          </button>
        </div>

        {/* Review Page Link */}
        <Link
          to={
            selectedCandidate
              ? `/studio/review?jobId=${activeJobId}&candidateId=${selectedCandidate.application_id}`
              : `/studio/review?jobId=${activeJobId}`
          }
          className="px-3 py-1.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-[13px] font-medium text-ink transition-colors flex items-center gap-1.5"
        >
          <UserCheck className="w-4 h-4 text-champagne" strokeWidth={1.75} />
          <span>Review</span>
        </Link>
      </div>
    </div>
  );
}
