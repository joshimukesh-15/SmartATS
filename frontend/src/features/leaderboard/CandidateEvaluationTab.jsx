import { ScoreBar } from '../../components/ui';

export default function CandidateEvaluationTab({ candidate, breakdown }) {
  if (!candidate || !breakdown) return null;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="space-y-2 p-4 rounded-[12px] bg-surface-alt/40 border border-line">
        <div className="text-[13px] font-medium text-ink flex items-center justify-between">
          <span>Multi-Pillar Score Progress</span>
          <span className="tabular-nums font-semibold text-[13px]">
            {breakdown.finalScore.toFixed(1)}%
          </span>
        </div>
        <ScoreBar
          skillsPoints={breakdown.skillsCoveredPoints}
          textMatchPoints={breakdown.textMatchPoints}
          experiencePoints={breakdown.experiencePoints}
          educationPoints={breakdown.educationPoints}
          finalScore={breakdown.finalScore}
          height="h-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-[13px] tabular-nums">
        <div className="p-3.5 rounded-[10px] border border-line bg-surface space-y-1">
          <div className="text-ink-muted flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Skills Coverage ({(breakdown.weightSkills * 100).toFixed(0)}%)</span>
          </div>
          <div className="text-[17px] font-semibold text-ink leading-[1.35]">
            {breakdown.skillsCoveredPoints.toFixed(1)} pts
          </div>
          <div className="text-[13px] leading-[1.5] text-ink-muted">
            {breakdown.skillsCoveredPercent.toFixed(1)}% match
          </div>
        </div>

        <div className="p-3.5 rounded-[10px] border border-line bg-surface space-y-1">
          <div className="text-ink-muted flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-champagne" />
            <span>Semantic Text ({(breakdown.weightText * 100).toFixed(0)}%)</span>
          </div>
          <div className="text-[17px] font-semibold text-ink leading-[1.35]">
            {breakdown.textMatchPoints.toFixed(1)} pts
          </div>
          <div className="text-[13px] leading-[1.5] text-ink-muted">
            {breakdown.textMatchPercent.toFixed(1)}% match
          </div>
        </div>

        <div className="p-3.5 rounded-[10px] border border-line bg-surface space-y-1">
          <div className="text-ink-muted flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-ink-muted" />
            <span>Experience Fit ({(breakdown.weightExperience * 100).toFixed(0)}%)</span>
          </div>
          <div className="text-[17px] font-semibold text-ink leading-[1.35]">
            {breakdown.experiencePoints.toFixed(1)} pts
          </div>
          <div className="text-[13px] leading-[1.5] text-ink-muted">
            {breakdown.experiencePercent.toFixed(1)}% score
          </div>
        </div>

        <div className="p-3.5 rounded-[10px] border border-line bg-surface space-y-1">
          <div className="text-ink-muted flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-champagne/40 border border-champagne" />
            <span>Education ({(breakdown.weightEducation * 100).toFixed(0)}%)</span>
          </div>
          <div className="text-[17px] font-semibold text-ink leading-[1.35]">
            {breakdown.educationPoints.toFixed(1)} pts
          </div>
          <div className="text-[13px] leading-[1.5] text-ink-muted">
            {breakdown.educationPercent.toFixed(1)}% credential
          </div>
        </div>
      </div>

      {candidate.score_explanation && (
        <div className="p-4 rounded-[10px] border border-line bg-surface space-y-1">
          <div className="text-[15px] font-semibold text-ink leading-[1.4]">Explain score</div>
          <p className="text-[13px] leading-[1.6] text-ink-muted whitespace-pre-line">
            {candidate.score_explanation}
          </p>
        </div>
      )}
    </div>
  );
}
