import { Check } from 'lucide-react';
import { Button } from '../../../components/ui';
import { normalizeStage } from '../constants';

const PIPELINE_STAGES = [
  { id: 'New', label: 'New' },
  { id: 'Reviewing', label: 'Reviewing' },
  { id: 'Interviewing', label: 'Interviewing' },
  { id: 'Offer', label: 'Offer' },
  { id: 'Hired', label: 'Hired' },
  { id: 'Rejected', label: 'Reject' },
];

export default function PipelineStepper({
  currentStage,
  workflow,
}) {
  const normalizedStage = normalizeStage(currentStage);
  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.id === normalizedStage);

  return (
    <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
      <h3 className="text-[17px] font-semibold text-ink">Pipeline</h3>
      <p className="mt-1 mb-4 text-[13px] text-ink-muted">
        Pick the next stage. You can add a note before confirming.
      </p>

      {/* Single responsive row of all 6 stages */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-0.5">
        {PIPELINE_STAGES.map(({ id, label }, idx) => {
          const isCur = id === normalizedStage;
          const isDone = currentStageIndex > idx && id !== 'Rejected';
          const isReject = id === 'Rejected';

          return (
            <button
              key={id}
              type="button"
              onClick={() => workflow.handleStageButtonClick(id)}
              disabled={workflow.isUpdatingStage}
              className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50 ${
                isCur
                  ? isReject
                    ? 'border-danger/30 bg-danger/10 text-danger font-semibold'
                    : 'border-primary bg-primary text-on-primary'
                  : isDone
                  ? 'border-line bg-surface text-ink hover:bg-surface-alt'
                  : isReject
                  ? 'border-line bg-surface text-danger/80 hover:bg-danger/10 hover:text-danger'
                  : 'border-line bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`}
            >
              {isDone && <Check className="h-3.5 w-3.5" />}
              {isCur && isReject ? 'Rejected' : label}
            </button>
          );
        })}
      </div>

      {/* Inline note row with input, Cancel, and Confirm */}
      {workflow.showTransitionPrompt && (
        <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-[12px] border border-line bg-surface-alt p-3.5">
          <span className="text-[13px] font-semibold text-ink">Move to {workflow.targetStage}</span>
          <input
            id="ni"
            value={workflow.transitionNote}
            onChange={(event) => workflow.setTransitionNote(event.target.value)}
            placeholder="Optional note"
            aria-label="Transition note"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.isComposing || e.keyCode === 229) return;
                e.preventDefault();
                workflow.handleConfirmStageUpdate();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                workflow.handleCancelTransition();
              }
            }}
            className="min-w-[200px] flex-1 rounded-[8px] border border-line bg-surface px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-muted focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          />
          <Button variant="secondary" size="sm" id="cx" onClick={workflow.handleCancelTransition}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            id="ok"
            onClick={workflow.handleConfirmStageUpdate}
            loading={workflow.isUpdatingStage}
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}
