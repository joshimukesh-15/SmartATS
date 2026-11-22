import { useState, useMemo } from 'react';
import { X, Printer, Users } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useCompareQuery } from '../../../hooks/useCompareCandidates';
import CompareMatrixTable from '../../compare/CompareMatrixTable';

const safeCompareQuery = typeof useCompareQuery === 'function'
  ? useCompareQuery
  : () => ({ data: null, isLoading: false });

export default function CompareModal({
  isOpen,
  onClose,
  activeJobId,
  activeJob,
  selectedAppIds = [],
  rawCandidates = [],
}) {
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  // Query comparison data from API
  const { data: compareResult, isLoading: compareLoading } = safeCompareQuery(
    activeJobId,
    selectedAppIds
  );

  // Identify comparison candidates from rankings data or compareResult
  const comparedCandidates = useMemo(() => {
    if (compareResult?.candidates?.length) {
      return compareResult.candidates;
    }
    return rawCandidates.filter((c) => selectedAppIds.includes(c.application_id));
  }, [compareResult, rawCandidates, selectedAppIds]);

  // Identify highest scorer (winner)
  const winnerId = useMemo(() => {
    if (!comparedCandidates.length) return null;
    let highest = comparedCandidates[0];
    for (const c of comparedCandidates) {
      if ((c.final_score ?? 0) > (highest.final_score ?? 0)) {
        highest = c;
      }
    }
    return highest.application_id;
  }, [comparedCandidates]);

  // Derive visible skills (all required skills + any matched skills across candidates)
  const visibleSkills = useMemo(() => {
    const set = new Set(activeJob?.required_skills || []);
    comparedCandidates.forEach((c) => {
      (c.matched_skills || []).forEach((s) => set.add(s));
    });
    const all = Array.from(set);

    if (!showDiffOnly) return all;

    return all.filter((skill) => {
      const statuses = comparedCandidates.map((c) =>
        (c.matched_skills || []).some(
          (s) => s.toLowerCase().trim() === skill.toLowerCase().trim()
        )
      );
      return !statuses.every((v) => v === statuses[0]);
    });
  }, [activeJob?.required_skills, comparedCandidates, showDiffOnly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[90vh] rounded-[16px] border border-line bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface-alt/30">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" strokeWidth={1.75} />
              <h2 className="text-[18px] font-semibold tracking-tight text-ink">
                Candidate Comparison Matrix
              </h2>
            </div>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Comparing {comparedCandidates.length} finalists for {activeJob?.title || 'Selected Job'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowDiffOnly((prev) => !prev)}
              className={`rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                showDiffOnly
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`}
            >
              Differences only
            </button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Export
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[8px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {compareLoading ? (
            <div className="space-y-4">
              <div className="h-12 bg-surface-alt/70 animate-pulse rounded-[10px]" />
              <div className="h-64 bg-surface-alt/40 animate-pulse rounded-[10px]" />
            </div>
          ) : comparedCandidates.length < 2 ? (
            <div className="text-center py-16 text-ink-muted text-[14px]">
              Select at least 2 candidates to compare competency matrices side-by-side.
            </div>
          ) : (
            <CompareMatrixTable
              comparedCandidates={comparedCandidates}
              winnerId={winnerId}
              activeJob={activeJob}
              visibleSkills={visibleSkills}
            />
          )}
        </div>
      </div>
    </div>
  );
}
