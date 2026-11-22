import CandidateListItem from '../components/CandidateListItem';
import ProfilePanel from '../components/ProfilePanel';

export default function ListView({
  candidates,
  activeJob,
  selection,
  workflow,
  computeBreakdownFn,
}) {
  const candidate = selection.selectedCandidate;
  const breakdown =
    candidate && computeBreakdownFn ? computeBreakdownFn(candidate, activeJob || {}) : null;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside
        className="sticky top-4 flex max-h-[calc(100vh-32px)] flex-col gap-2 overflow-y-auto"
        aria-label="Candidates"
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <h2 className="text-[13px] font-medium text-ink-muted">Candidate list</h2>
          <span className="text-[12px] tabular-nums text-ink-muted">
            {candidates.length} {candidates.length === 1 ? 'profile' : 'profiles'}
          </span>
        </div>
        {candidates.map((item, index) => {
          const itemBreakdown = computeBreakdownFn ? computeBreakdownFn(item, activeJob || {}) : {};
          const itemId = item.application_id ?? item.id ?? item.candidate_id;
          return (
            <CandidateListItem
              key={itemId || index}
              candidate={item}
              index={index}
              selected={String(itemId) === String(selection.effectiveCandidateId)}
              compared={selection.selectedForCompare.includes(item.application_id)}
              breakdown={itemBreakdown}
              onSelect={() => selection.setSelectedCandidateId(itemId)}
              onToggleCompare={(event) => {
                event.stopPropagation();
                selection.handleToggleCompare(item.application_id);
              }}
            />
          );
        })}
      </aside>

      {candidate && breakdown ? (
        <ProfilePanel
          candidate={candidate}
          activeJob={activeJob}
          breakdown={breakdown}
          selectedIndex={selection.safeSelectedIndex}
          compared={selection.selectedForCompare.includes(candidate.application_id)}
          onToggleCompare={() => selection.handleToggleCompare(candidate.application_id)}
          workflow={workflow}
        />
      ) : (
        <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8 text-[14px] text-ink-muted">
          Select a candidate to review their profile.
        </div>
      )}
    </div>
  );
}
