import { ChevronDown } from 'lucide-react';
import { computeBreakdown } from '../../lib/score';
import CandidateRow from './CandidateRow';

export default function LeaderboardTable({
  candidates = [],
  selectedForCompare = [],
  activeJob,
  onSelectCandidate,
  onToggleCompare,
  openStageMenuId,
  setOpenStageMenuId,
  onQuickStageChange,
  tableContainerRef,
  sortBy = 'score',
  sortOrder = 'desc',
  onSort,
}) {
  const handleSortClick = (key) => {
    if (!onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      onSort(key, key === 'name' ? 'asc' : 'desc');
    }
  };

  const renderSortHeader = (key, label, alignment = 'left', extraClasses = '') => {
    const isActive = sortBy === key;
    return (
      <th
        onClick={() => handleSortClick(key)}
        className={`py-3 font-medium cursor-pointer select-none group transition-colors hover:text-ink ${
          alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left'
        } ${extraClasses}`}
      >
        <div
          className={`inline-flex items-center gap-1 ${
            alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start'
          }`}
        >
          <span>{label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isActive
                ? sortOrder === 'asc'
                  ? 'rotate-180 text-champagne'
                  : 'rotate-0 text-champagne'
                : 'opacity-0 group-hover:opacity-40'
            }`}
            strokeWidth={1.75}
          />
        </div>
      </th>
    );
  };

  return (
    <div
      ref={tableContainerRef}
      className="w-full rounded-[14px] border border-line bg-surface overflow-hidden focus:outline-none transition-all duration-200 shadow-xs"
      tabIndex={0}
    >
      <div className="max-h-[700px] overflow-x-hidden xl:h-full xl:max-h-none xl:overflow-y-auto">
        <table className="w-full table-fixed border-collapse text-left text-[14px] text-ink">
          {/* Sticky Header with Backdrop Blur */}
          <thead className="sticky top-0 bg-surface/90 backdrop-blur-md z-10 border-b border-line text-[13px] font-medium text-ink-muted">
            <tr>
              <th className="hidden w-10 px-2 py-3 text-center sm:table-cell">
                <span className="sr-only">Select</span>
              </th>
              {renderSortHeader('rank', 'Rank', 'center', 'hidden w-14 px-2 sm:table-cell')}
              {renderSortHeader('name', 'Candidate', 'left', 'px-3')}
              {renderSortHeader('stage', 'Stage', 'left', 'w-24 px-2 xl:w-32')}
              {renderSortHeader('skills', 'Skills', 'right', 'hidden w-20 px-2 2xl:table-cell')}
              {renderSortHeader('text', 'Text', 'right', 'hidden w-20 px-2 2xl:table-cell')}
              {renderSortHeader(
                'score',
                <><span className="sm:hidden">Score</span><span className="hidden sm:inline">Final Score</span></>,
                'right',
                'w-20 px-2 sm:w-28 sm:px-3'
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {candidates.map((candidate, idx) => {
              const isCompared = selectedForCompare.includes(candidate.application_id);
              const breakdown = computeBreakdown(candidate, activeJob);

              return (
                <CandidateRow
                  key={candidate.application_id || idx}
                  candidate={candidate}
                  idx={idx}
                  isCompared={isCompared}
                  breakdown={breakdown}
                  onSelectCandidate={onSelectCandidate}
                  onToggleCompare={onToggleCompare}
                  openStageMenuId={openStageMenuId}
                  setOpenStageMenuId={setOpenStageMenuId}
                  onQuickStageChange={onQuickStageChange}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
