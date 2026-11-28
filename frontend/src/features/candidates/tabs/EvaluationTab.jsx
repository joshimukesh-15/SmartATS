import { SlidersHorizontal, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { ScoreBar } from '../../../components/ui/ScoreBar';

export default function EvaluationTab({ candidate, breakdown }) {
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
  const hasMultiPillar = Boolean(
    breakdown?.hasMultiPillar ||
    wExp > 0 ||
    wEdu > 0 ||
    ptsExp > 0 ||
    ptsEdu > 0 ||
    candidate.experience_score !== undefined ||
    candidate.education_score !== undefined ||
    compExp ||
    compEdu
  );

  const strengths = candidate.strengths || [];
  const gaps = candidate.gaps || [];

  const derivedStrengths = strengths.length > 0 ? strengths : [
    pSkills >= 80 ? `Strong technical skill alignment (${pSkills.toFixed(0)}% coverage)` : null,
    pText >= 80 ? `High semantic resume relevance (${pText.toFixed(0)}% text alignment)` : null,
    pExp >= 80 ? `Well-aligned industry experience (${candidate.experience_years ?? 0} years)` : null,
    pEdu >= 80 ? `Meets or exceeds education criteria (${candidate.education_level || 'Degree'})` : null,
    candidate.preferred_matched_skills?.length > 0 ? `Brings ${candidate.preferred_matched_skills.length} preferred bonus skill(s)` : null,
  ].filter(Boolean);

  const derivedGaps = gaps.length > 0 ? gaps : [
    pSkills < 60 ? `Missing several required skills (${candidate.missing_skills?.length || 0} skills unverified)` : null,
    pExp < 60 ? `Experience profile below target senior benchmark` : null,
    pText < 50 ? `Lower text semantic density against job description` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Score Progress Bar */}
      <div className="rounded-[12px] border border-line bg-surface p-4 space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink">
            {hasMultiPillar ? 'Multi-Pillar Score Progress' : 'Dual-Track Score Progress'}
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
          hasMultiPillar={hasMultiPillar}
          height="h-2.5"
        />
      </div>

      {/* 2. Component Pillar Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
        <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-[2px] bg-primary" />
              Skills Coverage ({Math.round(wSkills * 100)}%)
            </span>
            <span className="tabular-nums text-[13px]">
              {Number(pSkills).toFixed(1)}% match
            </span>
          </div>
          <div className="text-[17px] font-semibold text-ink tabular-nums leading-snug">
            {Number(ptsSkills).toFixed(1)} pts
          </div>
        </div>

        <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-[2px] bg-ink/45" />
              Semantic Text ({Math.round(wText * 100)}%)
            </span>
            <span className="tabular-nums text-[13px]">
              {Number(pText).toFixed(1)}% match
            </span>
          </div>
          <div className="text-[17px] font-semibold text-ink tabular-nums leading-snug">
            {Number(ptsText).toFixed(1)} pts
          </div>
        </div>

        {hasMultiPillar && (
          <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-[2px] bg-ink/80" />
                Experience Fit ({Math.round(wExp * 100)}%)
              </span>
              <span className="tabular-nums text-[13px]">
                {Number(pExp).toFixed(1)}% score
              </span>
            </div>
            <div className="text-[17px] font-semibold text-ink tabular-nums leading-snug">
              {Number(ptsExp).toFixed(1)} pts
            </div>
          </div>
        )}

        {hasMultiPillar && (
          <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-[2px] bg-ink/20 border border-line" />
                Education ({Math.round(wEdu * 100)}%)
              </span>
              <span className="tabular-nums text-[13px]">
                {Number(pEdu).toFixed(1)}% credential
              </span>
            </div>
            <div className="text-[17px] font-semibold text-ink tabular-nums leading-snug">
              {Number(ptsEdu).toFixed(1)} pts
            </div>
          </div>
        )}
      </div>

      {/* 3. Component Point Math */}
      <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[13px] font-semibold text-ink">
          <span>{hasMultiPillar ? 'Multi-Pillar Point Math' : 'Dual-Track Point Math'}</span>
          <span className="tabular-nums text-primary font-bold">
            Total: {Number(finalScore).toFixed(1)} pts
          </span>
        </div>
        <div data-testid="eval-tab-point-math-lines" className="space-y-1.5 text-[13px] tabular-nums">
          <div className="flex items-center justify-between text-ink">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <span className="h-2 w-2 rounded-[2px] bg-primary" />
              <span>Skills ({(wSkills * 100).toFixed(0)}%)</span>
            </span>
            <span className="font-medium">
              {wSkills.toFixed(2)} × {Number(pSkills).toFixed(1)}% = {Number(ptsSkills).toFixed(1)} pts
            </span>
          </div>

          <div className="flex items-center justify-between text-ink">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <span className="h-2 w-2 rounded-[2px] bg-ink/45" />
              <span>Text ({(wText * 100).toFixed(0)}%)</span>
            </span>
            <span className="font-medium">
              {wText.toFixed(2)} × {Number(pText).toFixed(1)}% = {Number(ptsText).toFixed(1)} pts
            </span>
          </div>

          {hasMultiPillar && (
            <>
              <div className="flex items-center justify-between text-ink">
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px] bg-ink/80" />
                  <span>Experience ({(wExp * 100).toFixed(0)}%)</span>
                </span>
                <span className="font-medium">
                  {wExp.toFixed(2)} × {Number(pExp).toFixed(1)}% = {Number(ptsExp).toFixed(1)} pts
                </span>
              </div>

              <div className="flex items-center justify-between text-ink">
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px] bg-ink/20 border border-line" />
                  <span>Education ({(wEdu * 100).toFixed(0)}%)</span>
                </span>
                <span className="font-medium">
                  {wEdu.toFixed(2)} × {Number(pEdu).toFixed(1)}% = {Number(ptsEdu).toFixed(1)} pts
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Matched Criteria, Strengths & Gaps */}
      {(derivedStrengths.length > 0 || derivedGaps.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
          {derivedStrengths.length > 0 && (
            <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <TrendingUp className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                <span>Profile Strengths</span>
              </div>
              <ul className="space-y-1.5 text-ink-muted text-[13px]">
                {derivedStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {derivedGaps.length > 0 && (
            <div className="rounded-[12px] border border-line bg-surface p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <AlertCircle className="h-4 w-4 text-ink-subtle shrink-0" strokeWidth={1.75} />
                <span>Identified Gaps</span>
              </div>
              <ul className="space-y-1.5 text-ink-muted text-[13px]">
                {derivedGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-[1px] bg-ink-subtle shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 5. Formula Explanation & Audit */}
      {(candidate.score_explanation || breakdown.formulaSummary) && (
        <div className="rounded-[12px] border border-line bg-surface-alt/40 p-4 space-y-1.5 text-[13px]">
          <div className="flex items-center gap-1.5 font-semibold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
            <span>Formula Explanation & Audit</span>
          </div>
          <p className="leading-relaxed whitespace-pre-line text-[13px] text-ink-muted">
            {candidate.score_explanation || breakdown.formulaSummary}
          </p>
        </div>
      )}
    </div>
  );
}
