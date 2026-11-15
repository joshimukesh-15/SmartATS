import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { STAGES } from './constants';

export default function ReviewPipeline({
  candidate,
  onStageChange,
  isPending = false,
}) {
  if (!candidate) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold text-ink">Recruitment Stage</span>
        <div className="flex items-center gap-2">
          {candidate.review_stage === 'Rejected' ? (
            <button
              type="button"
              onClick={() => onStageChange('Reviewing', 'Candidate reopened for review')}
              className="text-[13px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen candidate</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStageChange('Rejected', 'Candidate rejected during review')}
              className="px-2.5 py-1 rounded-[8px] border border-line bg-surface hover:bg-danger/10 hover:border-danger hover:text-danger text-[13px] text-ink-muted transition-colors cursor-pointer"
            >
              Mark Rejected
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Segmented Pipeline Stepper */}
      <div className="grid grid-cols-4 gap-2 bg-surface-alt/70 p-1.5 rounded-[12px] border border-line">
        {STAGES.map((s, idx) => {
          const currentStage = candidate.review_stage || 'New';
          const currentIdx = STAGES.indexOf(currentStage);
          const isCurrent = currentStage === s;
          const isCompleted = currentIdx > idx && currentStage !== 'Rejected';

          return (
            <button
              key={s}
              type="button"
              onClick={() => onStageChange(s)}
              disabled={isPending}
              className={`relative py-2.5 px-3 rounded-[10px] text-center transition-all cursor-pointer select-none ${
                isCurrent
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : isCompleted
                    ? 'bg-surface text-ink font-medium hover:bg-surface-alt'
                    : 'text-ink-muted hover:bg-surface/50'
              }`}
            >
              <div className="text-[13px] leading-tight flex items-center justify-center gap-1.5">
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne shrink-0" />
                )}
                <span className="truncate">{s}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
