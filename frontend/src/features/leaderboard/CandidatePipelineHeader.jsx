import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
} from 'lucide-react';
import { ScoreValue, Input, Button } from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';

export default function CandidatePipelineHeader({
  candidate,
  breakdown,
  safeSelectedIndex,
  onStageButtonClick,
  onConfirmStageUpdate,
  showTransitionPrompt,
  setShowTransitionPrompt,
  targetStage,
  setTargetStage,
  transitionNote,
  setTransitionNote,
  isUpdatingStage,
}) {
  const currentCandidateStage = candidate.review_stage || 'New';

  return (
    <div className="space-y-4 pb-6 border-b border-line">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold tabular-nums">
              Rank #{candidate.rank || safeSelectedIndex + 1}
            </span>
            <h2 className="text-[22px] font-semibold text-ink tracking-[-0.02em] leading-[1.25]">
              {cleanCandidateName(candidate.candidate_name)}
            </h2>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[13px] text-ink-muted flex-wrap">
            {candidate.experience_years !== undefined && (
              <span className="inline-flex items-center gap-1 font-medium text-ink">
                <Briefcase className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                <span className="tabular-nums">{candidate.experience_years} yrs exp</span>
                {candidate.seniority_level && (
                  <span className="text-ink-muted">({candidate.seniority_level})</span>
                )}
              </span>
            )}
            {candidate.education_level &&
              candidate.education_level !== 'Unspecified' && (
                <>
                  <span className="text-ink-subtle">·</span>
                  <span className="inline-flex items-center gap-1 text-ink">
                    <GraduationCap className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                    <span>{candidate.education_level}</span>
                  </span>
                </>
              )}
            {candidate.candidate_email && (
              <>
                <span className="text-ink-subtle">·</span>
                <span className="inline-flex items-center gap-1 text-ink-muted">
                  <Mail className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                  <span>{candidate.candidate_email}</span>
                </span>
              </>
            )}
            {candidate.candidate_phone && (
              <>
                <span className="text-ink-subtle">·</span>
                <span className="inline-flex items-center gap-1 text-ink-muted">
                  <Phone className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                  <span className="tabular-nums">{candidate.candidate_phone}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Score Tile */}
        <div className="text-right shrink-0 p-3 rounded-[10px] bg-surface-alt/40 border border-line min-w-[110px]">
          <div className="text-[13px] font-medium text-ink-muted">Final score</div>
          <ScoreValue score={breakdown.finalScore} size="xl" />
        </div>
      </div>

      {/* Integrated Horizontal Pipeline Ribbon */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-[13px] mb-2">
          <span className="font-semibold text-ink">Recruitment Stage</span>
          {currentCandidateStage === 'Rejected' ? (
            <button
              type="button"
              onClick={() => onStageButtonClick('Reviewing')}
              className="text-[13px] text-primary hover:underline font-medium cursor-pointer"
            >
              Re-open Application
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStageButtonClick('Rejected')}
              className="text-[13px] text-ink-muted hover:text-ink cursor-pointer px-2 py-0.5 rounded-[4px] border border-line hover:bg-surface-alt font-medium"
            >
              Mark Rejected
            </button>
          )}
        </div>

        {/* Horizontal Segmented Ribbon */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-[8px] bg-surface-alt/70 border border-line">
          {['New', 'Reviewing', 'Interview', 'Hired'].map((s, idx) => {
            const isCurrent = currentCandidateStage === s;
            return (
              <button
                key={s}
                type="button"
                aria-label={`Advance to stage ${idx + 1}`}
                onClick={() => onStageButtonClick(s)}
                disabled={isUpdatingStage}
                className={`py-2 px-2 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer text-center ${
                  isCurrent
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                }`}
              >
                <span aria-hidden="true">{s}</span>
              </button>
            );
          })}
        </div>

        {/* Transition Note Prompt */}
        {showTransitionPrompt && (
          <div className="mt-3 p-3 rounded-[8px] border border-line bg-surface space-y-2 animate-fadeIn">
            <div className="text-[13px] font-medium text-ink flex items-center gap-1.5">
              <span>Move candidate to:</span>
              <span className="font-bold text-primary">{targetStage}</span>
            </div>
            <Input
              placeholder="Optional transition reason or note..."
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowTransitionPrompt(false);
                  setTargetStage('');
                  setTransitionNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isUpdatingStage}
                onClick={onConfirmStageUpdate}
              >
                Confirm Move
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
