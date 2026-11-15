import { SlidersHorizontal } from 'lucide-react';
import { ScoreBar } from '../../components/ui/ScoreBar';

export default function ReviewEvaluationTab({ candidate, breakdown }) {
  if (!candidate || !breakdown) return null;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-[12px] bg-surface-alt/50 border border-line space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink">
            Multi-Pillar Score Progress
          </span>
          <span className="tabular-nums font-bold text-ink text-[14px]">
            {breakdown.finalScore.toFixed(1)}%
          </span>
        </div>
        <ScoreBar
          skillsPoints={breakdown.skillsCoveredPoints}
          textMatchPoints={breakdown.textMatchPoints}
          experiencePoints={breakdown.experiencePoints}
          educationPoints={breakdown.educationPoints}
          finalScore={breakdown.finalScore}
          height="h-2.5"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Skills Coverage ({Math.round((breakdown.weightSkills ?? 0.40) * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {breakdown.skillsCoveredPercent.toFixed(1)}% match
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {breakdown.skillsCoveredPoints.toFixed(1)} pts
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-champagne" />
              Semantic Text ({Math.round((breakdown.weightText ?? 0.20) * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {breakdown.textMatchPercent.toFixed(1)}% match
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {breakdown.textMatchPoints.toFixed(1)} pts
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ink-muted" />
              Experience Fit ({Math.round((breakdown.weightExperience ?? 0.25) * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {breakdown.experiencePercent.toFixed(1)}% score
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {breakdown.experiencePoints.toFixed(1)} pts
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-champagne/70" />
              Education ({Math.round((breakdown.weightEducation ?? 0.15) * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {breakdown.educationPercent.toFixed(1)}% credential
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {breakdown.educationPoints.toFixed(1)} pts
          </div>
        </div>
      </div>

      {candidate.score_explanation && (
        <div className="p-4 rounded-[12px] bg-surface-alt/40 border border-line space-y-2 text-[13px]">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-champagne" />
            <span>Transparent Math Formula & Audit</span>
          </div>
          <p className="text-ink-muted leading-relaxed whitespace-pre-line">
            {candidate.score_explanation}
          </p>
        </div>
      )}
    </div>
  );
}
