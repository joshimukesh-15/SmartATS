import { ChevronDown } from 'lucide-react';
import { computeBreakdown } from '../../lib/score';
import CandidateRow from './CandidateRow';

export default function LeaderboardTable({
  candidates = [],
  safeSelectedIndex,
  selectedForCompare = [],
  activeJob,
  onSelectCandidate,
  onToggleCompare,
  openStageMenuId,
  setOpenStageMenuId,
  onQuickStageChange,
  tableContainerRef,
  density = 'comfortable',
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
        className={`px-4 py-3 font-medium cursor-pointer select-none group transition-colors hover:text-ink ${
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
      <div className="overflow-x-auto max-h-[700px]">
        <table className="w-full text-left text-[14px] text-ink border-collapse">
          {/* Sticky Header with Backdrop Blur */}
          <thead className="sticky top-0 bg-surface/90 backdrop-blur-md z-10 border-b border-line text-[13px] font-medium text-ink-muted">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <span className="sr-only">Select</span>
              </th>
              {renderSortHeader('rank', 'Rank', 'center', 'w-16 px-3')}
              {renderSortHeader('name', 'Candidate', 'left', 'px-4')}
              {renderSortHeader('stage', 'Stage', 'left', 'w-32 px-3')}
              {renderSortHeader('skills', 'Skills', 'right', 'w-24 px-3 hidden sm:table-cell')}
              {renderSortHeader('text', 'Text', 'right', 'w-24 px-3 hidden sm:table-cell')}
              {renderSortHeader('score', 'Final Score', 'right', 'w-32 px-4')}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {candidates.map((candidate, idx) => {
              const isSelected = safeSelectedIndex === idx;
              const isCompared = selectedForCompare.includes(candidate.application_id);
              const breakdown = computeBreakdown(candidate, activeJob);

              return (
                <CandidateRow
                  key={candidate.application_id || idx}
                  candidate={candidate}
                  idx={idx}
                  isSelected={isSelected}
                  isCompared={isCompared}
                  breakdown={breakdown}
                  onSelectCandidate={onSelectCandidate}
                  onToggleCompare={onToggleCompare}
                  openStageMenuId={openStageMenuId}
                  setOpenStageMenuId={setOpenStageMenuId}
                  onQuickStageChange={onQuickStageChange}
                  density={density}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
