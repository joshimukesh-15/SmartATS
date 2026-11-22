import { Check } from 'lucide-react';
import { Button } from '../../../components/ui';
import { normalizeStage } from '../constants';

const PIPELINE_STAGES = ['New', 'Reviewing', 'Interviewing', 'Offer', 'Hired'];

export default function PipelineStepper({
  currentStage,
  workflow,
}) {
  const normalizedStage = normalizeStage(currentStage);
  const currentStageIndex = PIPELINE_STAGES.indexOf(normalizedStage);

  return (
    <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
      <h3 className="text-[17px] font-semibold text-ink">Pipeline</h3>
      <p className="mt-1 mb-4 text-[14px] text-ink-muted">
        Pick the next stage. You can add a note before confirming.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isCur = stage === normalizedStage;
          const isDone = currentStageIndex > idx;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => workflow.handleStageButtonClick(stage)}
              disabled={workflow.isUpdatingStage}
              className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50 ${
                isCur
                  ? 'border-primary bg-primary text-on-primary'
                  : isDone
                  ? 'border-line bg-surface text-ink hover:bg-surface-alt'
                  : 'border-line bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`}
            >
              {isDone && <Check className="h-3.5 w-3.5" />}
              {stage}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => workflow.handleStageButtonClick(normalizedStage === 'Rejected' ? 'Reviewing' : 'Rejected')}
          disabled={workflow.isUpdatingStage}
          className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50 sm:ml-auto ${
            normalizedStage === 'Rejected'
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-transparent bg-danger/10 text-danger hover:bg-danger/20'
          }`}
        >
          {normalizedStage === 'Rejected' ? 'Reopen candidate' : 'Reject'}
        </button>
      </div>

      {workflow.showTransitionPrompt && (
        <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-[12px] border border-line bg-champagne-soft/60 p-3.5">
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
            className="min-w-[200px] flex-1 rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
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
