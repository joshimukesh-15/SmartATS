import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import CandidateListItem from '../components/CandidateListItem';
import ProfilePanel from '../components/ProfilePanel';
import { useCandidateKeyboard } from '../hooks/useCandidateKeyboard';

/**
 * Lightweight virtualizer windowing when list exceeds 100 rows.
 */
function VirtualList({ items, renderItem, itemHeight = 64 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 650;
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 4);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + 4);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="relative overflow-y-auto max-h-[calc(100vh-96px)] pr-1"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }} className="flex flex-col gap-2">
          {visibleItems.map((item, i) => renderItem(item, startIndex + i))}
        </div>
      </div>
    </div>
  );
}

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

  const currentIndex = selection?.safeSelectedIndex ?? 0;
  const count = candidates.length;

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = candidates[currentIndex - 1];
      selection?.setSelectedCandidateId?.(prev.application_id ?? prev.id ?? prev.candidate_id);
    }
  };

  const handleNext = () => {
    if (currentIndex < count - 1) {
      const next = candidates[currentIndex + 1];
      selection?.setSelectedCandidateId?.(next.application_id ?? next.id ?? next.candidate_id);
    }
  };

  // Keyboard navigation: J/Down for next, K/Up for prev, Escape to unselect
  useCandidateKeyboard({
    candidates,
    candidatesCount: count,
    selectedIndex: currentIndex,
    onSelectPrev: handlePrev,
    onSelectNext: handleNext,
    onEscape: () => selection?.setSelectedCandidateId?.(null),
    enabled: true,
  });

  const hasAnySelected = Boolean(selection?.selectedForCompare?.length > 0);

  const renderCandidateRow = (item, index) => {
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
        anySelected={hasAnySelected}
        onSelect={() => selection?.setSelectedCandidateId?.(itemId)}
        onToggleCompare={(event) => {
          event.stopPropagation();
          selection?.handleToggleCompare?.(item.application_id);
        }}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Candidate List Column: sticky only from lg up */}
      <aside
        className={`flex flex-col gap-2 pr-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-96px)] ${
          candidates.length > 100 ? '' : 'lg:overflow-y-auto'
        } ${hasUrlSelection ? 'hidden lg:flex' : 'flex'}`}
        aria-label="Candidates"
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <h2 className="text-[13px] font-semibold text-ink">Candidate list</h2>
          {count > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] tabular-nums text-ink-muted">
                {currentIndex + 1} of {count}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  aria-label="Previous candidate (K)"
                  title="Previous candidate (K)"
                  className="rounded-[6px] border border-line bg-surface p-1 text-ink transition-colors hover:bg-surface-alt disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex >= count - 1}
                  aria-label="Next candidate (J)"
                  title="Next candidate (J)"
                  className="rounded-[6px] border border-line bg-surface p-1 text-ink transition-colors hover:bg-surface-alt disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {candidates.length > 100 ? (
          <VirtualList
            items={candidates}
            renderItem={renderCandidateRow}
            itemHeight={64}
          />
        ) : (
          candidates.map((item, index) => renderCandidateRow(item, index))
        )}
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
          <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8 text-[13px] text-ink-muted">
            Select a candidate to review their profile.
          </div>
        )}
      </div>
    </div>
  );
}
