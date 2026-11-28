import { useMemo, useState } from 'react';
import ProfileHeader from './ProfileHeader';
import PipelineStepper from './PipelineStepper';
import ScoreCard from './ScoreCard';
import ActivityTab from '../tabs/ActivityTab';
import { normalizeStage, displayName } from '../constants';

function computeInsights(candidate, breakdown) {
  const strengths = [];
  const gaps = [];

  const parts = [
    { name: 'Skills covered', score: breakdown.skillsCoveredPercent },
    { name: 'Text match', score: breakdown.textMatchPercent },
    { name: 'Experience', score: breakdown.experiencePercent },
    { name: 'Education', score: breakdown.educationPercent },
  ];

  parts.forEach((p) => {
    if (typeof p.score === 'number' && p.score >= 80) {
      strengths.push(`${p.name} is a strong match at ${p.score.toFixed(0)}%`);
    } else if (typeof p.score === 'number' && p.score < 40 && p.score >= 0) {
      gaps.push(`${p.name} is low at ${p.score.toFixed(1)}%, worth checking in interview`);
    }
  });

  if (candidate?.strengths?.length) {
    candidate.strengths.forEach((s) => {
      if (!strengths.includes(s)) strengths.push(s);
    });
  }

  if (candidate?.gaps?.length) {
    candidate.gaps.forEach((g) => {
      if (!gaps.includes(g)) gaps.push(g);
    });
  }

  return { strengths, gaps };
}

export default function ProfilePanel({
  candidate,
  activeJob,
  breakdown,
  selectedIndex,
  safeSelectedIndex,
  compared,
  onToggleCompare,
  workflow,
  stageWorkflow,
}) {
  const effectiveWorkflow = workflow || stageWorkflow || {};
  const [tab, setTab] = useState('evaluation');
  const currentStage = normalizeStage(candidate?.review_stage);
  const name = displayName(candidate?.candidate_name);
  const rank = candidate?.rank || (selectedIndex != null ? selectedIndex + 1 : (safeSelectedIndex != null ? safeSelectedIndex + 1 : 1));

  const matchedSkills = candidate.matched_skills || [];
  const requiredSkills = activeJob?.required_skills || [];
  const insights = useMemo(() => computeInsights(candidate, breakdown), [candidate, breakdown]);

  const experienceYears = candidate.experience_years ?? 0;
  const seniority = candidate.seniority_level ? `, ${candidate.seniority_level}` : '';
  const experienceText = `${experienceYears} years${seniority}`;
  const emailText = candidate.candidate_email || 'No email on file';

  const parts = [
    {
      name: 'Skills covered',
      weight: Math.round((breakdown.weightSkills || 0.4) * 100),
      match: Number(breakdown.skillsCoveredPercent || 0),
      points: Number(breakdown.skillsCoveredPoints || 0),
      dotClass: 'bg-primary',
      barClass: 'bg-primary',
    },
    {
      name: 'Text match',
      weight: Math.round((breakdown.weightText || 0.2) * 100),
      match: Number(breakdown.textMatchPercent || 0),
      points: Number(breakdown.textMatchPoints || 0),
      dotClass: 'bg-ink/45',
      barClass: 'bg-ink/45',
    },
    {
      name: 'Experience',
      weight: Math.round((breakdown.weightExperience || 0.25) * 100),
      match: Number(breakdown.experiencePercent || 0),
      points: Number(breakdown.experiencePoints || 0),
      dotClass: 'bg-ink/80',
      barClass: 'bg-ink/80',
    },
    {
      name: 'Education',
      weight: Math.round((breakdown.weightEducation || 0.15) * 100),
      match: Number(breakdown.educationPercent || 0),
      points: Number(breakdown.educationPoints || 0),
      dotClass: 'bg-ink/20 border border-line',
      barClass: 'bg-ink/20',
    },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-5" aria-live="polite" aria-label={`${name} candidate profile`}>
      <ProfileHeader
        candidate={candidate}
        name={name}
        rank={rank}
        currentStage={currentStage}
        experienceText={experienceText}
        emailText={emailText}
        compared={compared}
        onToggleCompare={onToggleCompare}
      />

      <PipelineStepper
        currentStage={currentStage}
        workflow={effectiveWorkflow}
      />

      <div className="-mb-1 mt-1 flex gap-1 border-b border-line" role="tablist" aria-label="Dossier tabs">
        {['Evaluation', 'Skills', 'Activity'].map((tabName, idx, arr) => {
          const isSel = tab.toLowerCase() === tabName.toLowerCase();
          return (
            <button
              key={tabName}
              type="button"
              role="tab"
              aria-selected={isSel}
              tabIndex={isSel ? 0 : -1}
              onKeyDown={(e) => {
                let nextIdx = null;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  nextIdx = (idx + 1) % arr.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  nextIdx = (idx - 1 + arr.length) % arr.length;
                } else if (e.key === 'Home') {
                  nextIdx = 0;
                } else if (e.key === 'End') {
                  nextIdx = arr.length - 1;
                }
                if (nextIdx !== null) {
                  e.preventDefault();
                  setTab(arr[nextIdx].toLowerCase());
                  const tabElements = e.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
                  tabElements?.[nextIdx]?.focus();
                }
              }}
              onClick={() => setTab(tabName.toLowerCase())}
              className={`-mb-px cursor-pointer border-b-2 px-3.5 py-2.5 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                isSel
                  ? 'border-primary text-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tabName}
            </button>
          );
        })}
      </div>

      {tab === 'evaluation' && (
        <ScoreCard
          candidate={candidate}
          breakdown={breakdown}
          parts={parts}
          insights={insights}
        />
      )}

      {tab === 'skills' && (
        <div className="space-y-5">
          <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
            <h3 className="text-[17px] font-semibold text-ink">Required skills</h3>
            <p className="mt-1 mb-4 text-[14px] text-ink-muted">
              Found by matching the resume against the job requirements.
            </p>
            {requiredSkills.length ? (
              <ul className="space-y-2.5 text-[14px] text-ink">
                {requiredSkills.map((skill) => {
                  const matched = matchedSkills.some((s) => s.toLowerCase().trim() === skill.toLowerCase().trim());
                  return (
                    <li
                      key={skill}
                      className="flex items-center justify-between gap-3 border-b border-line/40 py-2 last:border-0"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-[2px] bg-primary" />
                        {skill}
                      </span>
                      {matched ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Found in resume</span>
                      ) : (
                        <span className="font-semibold text-ink-muted">Missing</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <span className="text-[14px] text-ink-muted">No required skills were defined for this job.</span>
            )}
          </div>

          <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
            <h3 className="text-[17px] font-semibold text-ink">Matched on the resume</h3>
            <p className="mt-1 mb-4 text-[14px] text-ink-muted">Skills explicitly recognized in the candidate profile.</p>
            {matchedSkills.length ? (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-line bg-surface-alt px-3 py-1 text-[13px] font-medium text-ink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[14px] text-ink-muted">No skills were recognized on the resume.</span>
            )}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
          <h3 className="text-[17px] font-semibold text-ink">Notes and activity</h3>
          <p className="mt-1 mb-4 text-[14px] text-ink-muted">Newest first.</p>
          <ActivityTab candidate={candidate} stageWorkflow={effectiveWorkflow} />
        </div>
      )}
    </section>
  );
}
