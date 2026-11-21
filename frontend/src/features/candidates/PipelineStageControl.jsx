import { RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { STAGES } from './constants';

export default function PipelineStageControl({
  candidate,
  stageWorkflow,
  onStageButtonClick: propOnStageButtonClick,
  onConfirmStageUpdate: propOnConfirmStageUpdate,
  onStageChange: propOnStageChange,
  showTransitionPrompt: propShowTransitionPrompt,
  setShowTransitionPrompt: propSetShowTransitionPrompt,
  targetStage: propTargetStage,
  setTargetStage: propSetTargetStage,
  transitionNote: propTransitionNote,
  setTransitionNote: propSetTransitionNote,
  isUpdatingStage: propIsUpdatingStage,
  className = '',
}) {
  if (!candidate) return null;

  // Resolve values from stageWorkflow or props
  const showPrompt = stageWorkflow?.showTransitionPrompt ?? propShowTransitionPrompt ?? false;
  const target = stageWorkflow?.targetStage ?? propTargetStage ?? '';
  const note = stageWorkflow?.transitionNote ?? propTransitionNote ?? '';
  const setNote = stageWorkflow?.setTransitionNote ?? propSetTransitionNote ?? (() => {});
  const setTarget = stageWorkflow?.setTargetStage ?? propSetTargetStage ?? (() => {});
  const setPrompt = stageWorkflow?.setShowTransitionPrompt ?? propSetShowTransitionPrompt ?? (() => {});
  const isUpdating = Boolean(stageWorkflow?.isUpdatingStage ?? propIsUpdatingStage ?? false);

  const handleStageClick = (s) => {
    if (stageWorkflow?.handleStageButtonClick) {
      stageWorkflow.handleStageButtonClick(s);
    } else if (propOnStageButtonClick) {
      propOnStageButtonClick(s);
    } else if (propOnStageChange) {
      propOnStageChange(s);
    } else {
      setTarget(s);
      setPrompt(true);
    }
  };

  const handleConfirm = () => {
    if (stageWorkflow?.handleConfirmStageUpdate) {
      stageWorkflow.handleConfirmStageUpdate();
    } else if (propOnConfirmStageUpdate) {
      propOnConfirmStageUpdate();
    } else if (propOnStageChange && target) {
      propOnStageChange(target, note);
      setPrompt(false);
      setTarget('');
      setNote('');
    }
  };

  const handleCancel = () => {
    if (stageWorkflow?.handleCancelTransition) {
      stageWorkflow.handleCancelTransition();
    } else {
      setPrompt(false);
      setTarget('');
      setNote('');
    }
  };

  const currentStage = candidate.review_stage || 'New';
  const isRejected = currentStage === 'Rejected';

  // Stepper shows progressive milestones (excluding Rejected)
  const progressiveStages = STAGES.filter((s) => s !== 'Rejected');

  // Normalize match for alias (e.g. 'Interview' vs 'Interviewing')
  const normalizeStage = (st) => (st === 'Interview' ? 'Interviewing' : st);
  const normalizedCurrent = normalizeStage(currentStage);
  const currentIdx = progressiveStages.indexOf(normalizedCurrent);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Top Header Row: Stage Label and Quick Actions */}
      <div className="flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Recruitment Stage</span>
          <span className="text-[12px] text-ink-muted">
            Current: <strong className="text-ink font-semibold">{currentStage}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRejected ? (
            <button
              type="button"
              onClick={() => handleStageClick('Reviewing')}
              disabled={isUpdating}
              className="text-[13px] text-primary hover:underline flex items-center gap-1.5 cursor-pointer font-medium disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Reopen candidate</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStageClick('Rejected')}
              disabled={isUpdating}
              className="px-2.5 py-1 rounded-[6px] border border-line bg-surface hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 text-[12px] text-ink-muted transition-colors cursor-pointer font-medium disabled:opacity-50"
            >
              Mark Rejected
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Segmented Pipeline Stepper */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-[12px] bg-surface-alt/70 border border-line">
        {progressiveStages.map((s, idx) => {
          const isCurrent = normalizedCurrent === s;
          const isCompleted = currentIdx > idx && !isRejected;

          return (
            <button
              key={s}
              type="button"
              aria-label={`Advance to stage ${idx + 1}: ${s}`}
              onClick={() => handleStageClick(s)}
              disabled={isUpdating}
              className={`relative py-2 px-1.5 sm:px-2 rounded-[8px] text-center transition-all cursor-pointer select-none disabled:opacity-50 ${
                isCurrent
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : isCompleted
                    ? 'bg-surface text-ink font-medium hover:bg-surface-alt border border-line/50'
                    : 'text-ink-muted hover:text-ink hover:bg-surface/60'
              }`}
            >
              <div className="text-[12px] sm:text-[13px] leading-tight flex items-center justify-center gap-1">
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne shrink-0" strokeWidth={2} />
                )}
                <span className="truncate">{s}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Transition Note Prompt */}
      {showPrompt && (
        <div className="p-3.5 rounded-[10px] border border-line bg-surface space-y-2.5 animate-fadeIn shadow-xs">
          <div className="text-[13px] font-medium text-ink flex items-center gap-1.5">
            <span>Move candidate to:</span>
            <span className="font-bold text-primary flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5 text-ink-subtle" strokeWidth={2} />
              {target}
            </span>
          </div>

          <Input
            placeholder="Optional transition reason or note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-[13px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isUpdating}
              onClick={handleConfirm}
            >
              Confirm Move
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
