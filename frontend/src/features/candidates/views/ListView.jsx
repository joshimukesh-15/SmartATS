import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CandidateListItem from '../components/CandidateListItem';
import ProfilePanel from '../components/ProfilePanel';

export default function ListView({
  candidates = [],
  activeJob,
  selection,
  workflow,
  computeBreakdownFn,
}) {
  const [searchParams] = useSearchParams();
  const hasUrlSelection = Boolean(
    searchParams.get('candidate') || searchParams.get('candidateId')
  );

  // Memoize breakdown calculations keyed on the candidate list and job weights
  const breakdowns = useMemo(() => {
    if (!computeBreakdownFn) return new Map();
    const map = new Map();
    candidates.forEach((cand) => {
      const id = cand.application_id ?? cand.id ?? cand.candidate_id;
      map.set(id, computeBreakdownFn(cand, activeJob || {}));
    });
    return map;
  }, [candidates, activeJob, computeBreakdownFn]);

  const candidate = selection?.selectedCandidate;
  const candidateId = candidate
    ? candidate.application_id ?? candidate.id ?? candidate.candidate_id
    : null;
  const breakdown = candidateId
    ? breakdowns.get(candidateId) || (computeBreakdownFn ? computeBreakdownFn(candidate, activeJob || {}) : null)
    : null;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Candidate List Column: sticky only from lg up */}
      <aside
        className={`flex flex-col gap-2 pr-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto ${
          hasUrlSelection ? 'hidden lg:flex' : 'flex'
        }`}
        aria-label="Candidates"
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <h2 className="text-[13px] font-medium text-ink-muted">Candidate list</h2>
          <span className="text-[12px] tabular-nums text-ink-muted">
            {candidates.length} {candidates.length === 1 ? 'profile' : 'profiles'}
          </span>
        </div>
        {candidates.map((item, index) => {
          const itemId = item.application_id ?? item.id ?? item.candidate_id;
          const itemBreakdown =
            breakdowns.get(itemId) ||
            (computeBreakdownFn ? computeBreakdownFn(item, activeJob || {}) : {});
          return (
            <CandidateListItem
              key={itemId || index}
              candidate={item}
              index={index}
              selected={String(itemId) === String(selection?.effectiveCandidateId)}
              compared={selection?.selectedForCompare?.includes(item.application_id)}
              breakdown={itemBreakdown}
              onSelect={() => selection?.setSelectedCandidateId?.(itemId)}
              onToggleCompare={(event) => {
                event.stopPropagation();
                selection?.handleToggleCompare?.(item.application_id);
              }}
            />
          );
        })}
      </aside>

      {/* Profile Column: below lg, visible only when a candidate is selected in URL */}
      <div className={`min-w-0 ${hasUrlSelection ? 'block' : 'hidden lg:block'}`}>
        {/* Back to list button visible below lg */}
        <button
          type="button"
          onClick={() => selection?.setSelectedCandidateId?.(null)}
          className="mb-4 inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors lg:hidden cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to list</span>
        </button>

        {candidate && breakdown ? (
          <ProfilePanel
            candidate={candidate}
            activeJob={activeJob}
            breakdown={breakdown}
            selectedIndex={selection?.safeSelectedIndex}
            compared={selection?.selectedForCompare?.includes(candidate.application_id)}
            onToggleCompare={() => selection?.handleToggleCompare?.(candidate.application_id)}
            workflow={workflow}
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8 text-[14px] text-ink-muted">
            Select a candidate to review their profile.
          </div>
        )}
      </div>
    </div>
  );
}
