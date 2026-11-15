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
}) {
  return (
    <div
      ref={tableContainerRef}
      className="w-full rounded-[14px] border border-line bg-surface overflow-hidden focus:outline-none transition-all duration-200"
      tabIndex={0}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px] text-ink border-collapse">
          <thead className="border-b border-line bg-surface-alt/40 text-[13px] font-medium text-ink-muted">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <span className="sr-only">Select</span>
              </th>
              <th className="w-14 px-3 py-3 text-center font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="w-32 px-3 py-3 font-medium">Stage</th>
              <th className="w-20 px-3 py-3 text-right font-medium hidden sm:table-cell">
                Skills
              </th>
              <th className="w-20 px-3 py-3 text-right font-medium hidden sm:table-cell">
                Text
              </th>
              <th className="w-28 px-4 py-3 text-right font-medium">Final Score</th>
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
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
