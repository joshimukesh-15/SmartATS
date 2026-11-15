import { Search } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Badge } from '../../components/ui/Tag';
import { cleanCandidateName } from '../../lib/format';
import { computeBreakdown } from '../../lib/score';
import { STAGES } from './constants';

export default function CandidateRoster({
  rawCandidates = [],
  filteredCandidates = [],
  searchQuery,
  setSearchQuery,
  stageFilter,
  setStageFilter,
  selectedCandidateId,
  onSelectCandidate,
  activeJob,
}) {
  return (
    <div className="lg:col-span-4 space-y-4">
      {/* Search & Stage Filter Strip */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-[10px] border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Stage Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[13px] no-scrollbar">
          {['ALL', ...STAGES, 'Rejected'].map((stage) => {
            const count =
              stage === 'ALL'
                ? rawCandidates.length
                : rawCandidates.filter((c) => (c.review_stage || 'New') === stage).length;
            const active = stageFilter === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                className={`px-2.5 py-1 rounded-[8px] border text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-surface hover:bg-surface-alt text-ink-muted'
                }`}
              >
                <span>{stage}</span>{' '}
                <span className="tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate List Cards */}
      <Panel className="p-3 max-h-[calc(100vh-16rem)] overflow-y-auto divide-y divide-line/40">
        {filteredCandidates.length === 0 ? (
          <div className="p-6 text-center text-ink-muted text-[13px]">
            No candidates match the filter.
          </div>
        ) : (
          filteredCandidates.map((candidate, idx) => {
            const isSelected = candidate.application_id === selectedCandidateId;
            const bd = computeBreakdown(candidate, activeJob);
            const stage = candidate.review_stage || 'New';

            return (
              <div
                key={candidate.application_id}
                onClick={() => onSelectCandidate(candidate.application_id)}
                className={`p-3 rounded-[10px] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-surface-alt border border-line shadow-xs'
                    : 'hover:bg-surface-alt/50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] tabular-nums font-semibold text-ink-muted">
                        #{candidate.rank || idx + 1}
                      </span>
                      <span className="text-[15px] font-medium text-ink truncate">
                        {cleanCandidateName(candidate.candidate_name)}
                      </span>
                    </div>
                    <div className="text-[13px] text-ink-muted mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="tabular-nums">{candidate.experience_years || 0} yrs exp</span>
                      <span>·</span>
                      <span>{candidate.seniority_level || 'Mid-Level'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-[13px] font-semibold text-ink tabular-nums">
                      {bd.finalScore.toFixed(1)}%
                    </span>
                    <div>
                      <Badge
                        variant={
                          stage === 'Hired'
                            ? 'champagne'
                            : stage === 'Rejected'
                              ? 'danger'
                              : 'secondary'
                        }
                        className="text-[13px] px-1.5 py-0.5"
                      >
                        {stage}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Panel>

      <div className="text-[13px] text-ink-subtle text-center">
        Use <kbd className="px-1.5 py-0.5 rounded-[4px] border border-line bg-surface-alt text-[13px]">↑</kbd>{' '}
        <kbd className="px-1.5 py-0.5 rounded-[4px] border border-line bg-surface-alt text-[13px]">↓</kbd> to browse candidates
      </div>
    </div>
  );
}
