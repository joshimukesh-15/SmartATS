import { SlidersHorizontal } from 'lucide-react';
import { ScoreBar } from '../../components/ui/ScoreBar';

export default function ReviewEvaluationTab({ candidate, breakdown }) {
  if (!candidate || !breakdown) return null;

  const compSkills = candidate.components?.skills;
  const compText = candidate.components?.text;
  const compExp = candidate.components?.experience;
  const compEdu = candidate.components?.education;

  const wSkills = compSkills?.weight ?? breakdown.weightSkills ?? 0.40;
  const wText = compText?.weight ?? breakdown.weightText ?? 0.20;
  const wExp = compExp?.weight ?? breakdown.weightExperience ?? 0.25;
  const wEdu = compEdu?.weight ?? breakdown.weightEducation ?? 0.15;

  const pSkills = compSkills?.percentage ?? breakdown.skillsCoveredPercent ?? 0;
  const pText = compText?.percentage ?? breakdown.textMatchPercent ?? 0;
  const pExp = compExp?.percentage ?? breakdown.experiencePercent ?? 0;
  const pEdu = compEdu?.percentage ?? breakdown.educationPercent ?? 0;

  const ptsSkills = compSkills?.points ?? breakdown.skillsCoveredPoints ?? 0;
  const ptsText = compText?.points ?? breakdown.textMatchPoints ?? 0;
  const ptsExp = compExp?.points ?? breakdown.experiencePoints ?? 0;
  const ptsEdu = compEdu?.points ?? breakdown.educationPoints ?? 0;

  const finalScore = candidate.final_score ?? breakdown.finalScore ?? 0;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-[12px] bg-surface-alt/50 border border-line space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink">
            Multi-Pillar Score Progress
          </span>
          <span className="tabular-nums font-bold text-ink text-[14px]">
            {Number(finalScore).toFixed(1)}%
          </span>
        </div>
        <ScoreBar
          skillsPoints={ptsSkills}
          textMatchPoints={ptsText}
          experiencePoints={ptsExp}
          educationPoints={ptsEdu}
          finalScore={finalScore}
          hasMultiPillar={true}
          height="h-2.5"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Skills Coverage ({Math.round(wSkills * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {Number(pSkills).toFixed(1)}% match
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {Number(ptsSkills).toFixed(1)} pts
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-champagne" />
              Semantic Text ({Math.round(wText * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {Number(pText).toFixed(1)}% match
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {Number(ptsText).toFixed(1)} pts
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ink-muted" />
              Experience Fit ({Math.round(wExp * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {Number(pExp).toFixed(1)}% score
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {Number(ptsExp).toFixed(1)} pts
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-champagne/70" />
              Education ({Math.round(wEdu * 100)}%)
            </span>
            <span className="text-[13px] tabular-nums">
              {Number(pEdu).toFixed(1)}% credential
            </span>
          </div>
          <div className="text-[16px] font-bold text-ink tabular-nums">
            {Number(ptsEdu).toFixed(1)} pts
          </div>
        </div>
      </div>

      {(candidate.score_explanation || breakdown.formulaSummary) && (
        <div className="p-4 rounded-[12px] bg-surface-alt/40 border border-line space-y-2 text-[13px]">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-champagne" strokeWidth={1.75} />
            <span>Transparent Math Formula & Audit</span>
          </div>
          <p className="text-ink-muted leading-relaxed whitespace-pre-line">
            {candidate.score_explanation || breakdown.formulaSummary}
          </p>
        </div>
      )}
    </div>
  );
}
