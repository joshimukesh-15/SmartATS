import { Link } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { Input } from '../../components/ui';
import { STAGES } from './constants';

export default function LeaderboardFilters({
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  rawCandidates = [],
  activeJobId,
  selectedCandidate,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-[14px] bg-surface border border-line">
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

      {/* Right: Sort controls & Layout switcher */}
      <div className="flex items-center gap-2 text-[13px] text-ink-muted shrink-0 flex-wrap">
        <span className="hidden xl:inline">Sort:</span>
        <button
          type="button"
          onClick={() => {
            if (sortBy === 'score') {
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
            } else {
              setSortBy('score');
              setSortOrder('desc');
            }
          }}
          className={`px-3 py-1.5 rounded-[8px] border border-line cursor-pointer text-[13px] font-medium ${
            sortBy === 'score' ? 'bg-surface-alt text-ink font-semibold' : 'bg-surface'
          }`}
        >
          Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          type="button"
          onClick={() => {
            if (sortBy === 'name') {
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
            } else {
              setSortBy('name');
              setSortOrder('asc');
            }
          }}
          className={`px-3 py-1.5 rounded-[8px] border border-line cursor-pointer text-[13px] font-medium ${
            sortBy === 'name' ? 'bg-surface-alt text-ink font-semibold' : 'bg-surface'
          }`}
        >
          Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>

        {/* Layout mode switcher */}
        <Link
          to={
            selectedCandidate
              ? `/studio/review?jobId=${activeJobId}&candidateId=${selectedCandidate.application_id}`
              : `/studio/review?jobId=${activeJobId}`
          }
          className="px-3 py-1.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-[13px] font-medium text-ink transition-colors flex items-center gap-1.5 ml-1"
        >
          <UserCheck className="w-4 h-4 text-champagne" strokeWidth={1.75} />
          <span>Open Candidate Review</span>
        </Link>
      </div>
    </div>
  );
}
