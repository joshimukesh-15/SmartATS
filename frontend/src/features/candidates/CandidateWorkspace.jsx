import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  Download,
  Eye,
  GitCompare,
  Search,
} from 'lucide-react';
import { Button, EmptyState, Input, Select, Skeleton, StatusBadge } from '../../components/ui';
import { downloadResumeFile, previewResumeFile } from '../../api/applications';
import { useJobs, useRankings } from '../../hooks';
import { computeBreakdown } from '../../lib/score';
import { useCandidateSelection, useStageWorkflow } from './index';
import ActivityTab from './tabs/ActivityTab';

const PIPELINE_STAGES = ['New', 'Reviewing', 'Interviewing', 'Offer', 'Hired'];
const FILTER_STAGES = ['All', ...PIPELINE_STAGES, 'Rejected'];

function displayStage(stage) {
  return stage === 'Interview' ? 'Interviewing' : stage || 'New';
}

function getInitials(name = '') {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'C';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

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
    if (p.score >= 80) {
      strengths.push(`${p.name} is a strong match at ${p.score.toFixed(0)}%`);
    } else if (p.score < 40) {
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

function CandidateListItem({
  candidate,
  index,
  selected,
  compared,
  breakdown,
  onSelect,
  onToggleCompare,
}) {
  const stage = displayStage(candidate.review_stage);
  const name = candidate.candidate_name || 'Candidate';
  const initials = getInitials(name);
  const rank = candidate.rank || index + 1;
  const score = Number(breakdown.finalScore || 0).toFixed(1);

  return (
    <div
      className={`rounded-[14px] border transition-colors ${
        selected
          ? 'border-line bg-surface-alt shadow-[inset_3px_0_0_0_var(--color-primary)]'
          : 'border-line bg-surface hover:bg-surface-alt/70'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-selected={selected}
        className="flex w-full cursor-pointer items-center gap-3 p-3 text-left select-none"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/60 bg-surface-alt text-[13px] font-semibold text-ink">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-ink">{name}</div>
          <div className="truncate text-[13px] text-ink-muted">
            {stage} · #{rank}
          </div>
        </div>
        <div className="ml-auto shrink-0 text-[14px] font-semibold tabular-nums text-ink">
          {score}%
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-line/50 px-3 py-1.5 text-[11px] text-ink-muted">
        <label className="flex cursor-pointer items-center gap-1.5 select-none">
          <input
            type="checkbox"
            checked={compared}
            onChange={onToggleCompare}
            onClick={(event) => event.stopPropagation()}
            className="rounded accent-primary"
            aria-label={`Add ${name} to comparison`}
          />
          <span>Compare candidate</span>
        </label>
        {compared && <span className="font-medium text-primary">Selected</span>}
      </div>
    </div>
  );
}

function ProfilePanel({
  candidate,
  activeJob,
  breakdown,
  selectedIndex,
  compared,
  onToggleCompare,
  workflow,
}) {
  const [tab, setTab] = useState('evaluation');
  const currentStage = displayStage(candidate.review_stage);
  const currentStageIndex = PIPELINE_STAGES.indexOf(currentStage);
  const name = candidate.candidate_name || 'Candidate';
  const initials = getInitials(name);
  const rank = candidate.rank || selectedIndex + 1;
  const finalScore = Number(breakdown.finalScore || 0).toFixed(1);

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
      dotClass: 'bg-champagne',
      barClass: 'bg-champagne',
    },
    {
      name: 'Experience',
      weight: Math.round((breakdown.weightExperience || 0.25) * 100),
      match: Number(breakdown.experiencePercent || 0),
      points: Number(breakdown.experiencePoints || 0),
      dotClass: 'bg-ink-muted',
      barClass: 'bg-ink-muted',
    },
    {
      name: 'Education',
      weight: Math.round((breakdown.weightEducation || 0.15) * 100),
      match: Number(breakdown.educationPercent || 0),
      points: Number(breakdown.educationPoints || 0),
      dotClass: 'bg-champagne/60',
      barClass: 'bg-champagne/60',
    },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-5" aria-live="polite" aria-label={`${name} candidate profile`}>
      {/* Sticky Profile Header */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3.5 border-b border-line bg-canvas/90 py-3 backdrop-blur-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface-alt text-[15px] font-semibold text-ink">
          {initials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[22px] font-semibold tracking-[-0.02em] text-ink">{name}</h2>
          <div className="truncate text-[14px] text-ink-muted">
            {experienceText} · {emailText}
          </div>
        </div>
        <span className="rounded-lg border border-champagne/30 bg-champagne-soft px-2.5 py-0.5 text-[13px] font-semibold text-champagne">
          Rank #{rank}
        </span>
        <StatusBadge status={currentStage} size="sm" />
        <div className="ml-auto flex items-center gap-2">
          {candidate.application_id && (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Eye className="h-3.5 w-3.5" />}
                onClick={() => previewResumeFile(candidate.application_id)}
              >
                Preview resume
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={() => downloadResumeFile(candidate.application_id, `${name}_Resume.pdf`)}
              >
                Download
              </Button>
            </>
          )}
          <Button
            variant={compared ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<GitCompare className="h-3.5 w-3.5" />}
            onClick={onToggleCompare}
          >
            {compared ? 'Remove comparison' : 'Add to compare'}
          </Button>
        </div>
      </div>

      {/* Pipeline Stage Stepper Card */}
      <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
        <h3 className="text-[17px] font-semibold text-ink">Pipeline</h3>
        <p className="mt-1 mb-4 text-[14px] text-ink-muted">
          Pick the next stage. You can add a note before confirming.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCur = stage === currentStage;
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
            onClick={() => workflow.handleStageButtonClick(currentStage === 'Rejected' ? 'Reviewing' : 'Rejected')}
            disabled={workflow.isUpdatingStage}
            className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50 sm:ml-auto ${
              currentStage === 'Rejected'
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-transparent bg-danger/10 text-danger hover:bg-danger/20'
            }`}
          >
            {currentStage === 'Rejected' ? 'Reopen candidate' : 'Reject'}
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

      {/* Tabs Bar */}
      <div className="-mb-1 mt-1 flex gap-1 border-b border-line" role="tablist">
        {['Evaluation', 'Skills', 'Activity'].map((tabName) => {
          const isSel = tab.toLowerCase() === tabName.toLowerCase();
          return (
            <button
              key={tabName}
              type="button"
              role="tab"
              aria-selected={isSel}
              onClick={() => setTab(tabName.toLowerCase())}
              className={`-mb-px cursor-pointer border-b-2 px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
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

      {/* Tab Panels */}
      {tab === 'evaluation' && (
        <div className="space-y-5">
          {/* Score breakdown card */}
          <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
            <h3 className="text-[17px] font-semibold text-ink">Score breakdown</h3>
            <p className="mt-1 mb-4 text-[14px] text-ink-muted">
              Final score is the sum of weighted points from four parts.
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-[56px] font-semibold leading-none tracking-[-0.045em] tabular-nums text-ink">
                {finalScore}
              </span>
              <span className="text-[14px] text-ink-muted">out of 100 points</span>
            </div>

            {/* Stacked bar */}
            <div className="my-5 flex h-3 overflow-hidden rounded-full bg-surface-alt">
              {parts.map((p) => (
                <i
                  key={p.name}
                  style={{ width: `${Math.min(Math.max(p.points, 0), 100)}%` }}
                  className={`block h-full transition-[width] duration-500 ease-out ${p.barClass}`}
                  title={`${p.name}: ${p.points.toFixed(1)} pts`}
                />
              ))}
            </div>

            {/* Breakdown table */}
            <div className="mt-2">
              <div className="grid grid-cols-[1.4fr_70px_90px_1.6fr_80px] items-center gap-3 py-2 text-[13px] text-ink-muted max-[1000px]:grid-cols-[1.4fr_60px_80px]">
                <span>Part</span>
                <span>Weight</span>
                <span>Match</span>
                <span className="hidden min-[1001px]:block"></span>
                <span className="text-right">Points</span>
              </div>
              {parts.map((p) => (
                <div
                  key={p.name}
                  className="grid grid-cols-[1.4fr_70px_90px_1.6fr_80px] items-center gap-3 border-t border-line py-3.5 text-[14px] max-[1000px]:grid-cols-[1.4fr_60px_80px]"
                >
                  <div className="flex min-w-0 items-center font-semibold text-ink">
                    <span className={`mr-2.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${p.dotClass}`} />
                    <span className="truncate">{p.name}</span>
                  </div>
                  <span className="tabular-nums text-ink-muted">{p.weight}%</span>
                  <span className="tabular-nums text-ink-muted">{p.match.toFixed(1)}%</span>
                  <div className="hidden h-1.5 overflow-hidden rounded-full bg-surface-alt min-[1001px]:block">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${p.barClass}`}
                      style={{ width: `${Math.min(Math.max(p.match, 0), 100)}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold tabular-nums text-ink">{p.points.toFixed(1)}</span>
                </div>
              ))}
            </div>

            <details className="mt-5 rounded-xl border border-line bg-surface-alt/40 px-3.5 py-2.5 text-[12px] text-ink-muted">
              <summary className="cursor-pointer font-medium text-ink">Scoring explanation</summary>
              <p className="mt-2 leading-relaxed whitespace-pre-line">
                {candidate.score_explanation || breakdown.formulaSummary || 'Each pillar score is multiplied by its configured weight to calculate the total.'}
              </p>
            </details>
          </div>

          {/* Strengths & Gaps Two-Column */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
              <h3 className="text-[17px] font-semibold text-ink">Strengths</h3>
              <p className="mt-1 mb-4 text-[14px] text-ink-muted">From parts scoring 80% or more.</p>
              {insights.strengths.length ? (
                <ul className="space-y-2.5 text-[14px] text-ink">
                  {insights.strengths.map((str) => (
                    <li key={str} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[14px] text-ink-muted">No standout strengths yet.</span>
              )}
            </div>

            <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
              <h3 className="text-[17px] font-semibold text-ink">Gaps to review</h3>
              <p className="mt-1 mb-4 text-[14px] text-ink-muted">From parts scoring under 40%.</p>
              {insights.gaps.length ? (
                <ul className="space-y-2.5 text-[14px] text-ink">
                  {insights.gaps.map((gap) => (
                    <li key={gap} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-champagne" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[14px] text-ink-muted">No gaps flagged.</span>
              )}
            </div>
          </div>
        </div>
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
                        <span className="h-2 w-2 rounded-full bg-primary" />
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
          <ActivityTab candidate={candidate} stageWorkflow={workflow} />
        </div>
      )}
    </section>
  );
}

export default function CandidateWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const activeJobId = searchParams.get('jobId') || (jobs[0] ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((job) => String(job.job_id) === String(activeJobId));
  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(activeJobId);
  const rawCandidates = useMemo(() => rankingsData?.rankings || [], [rankingsData?.rankings]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rawCandidates.filter((candidate) => {
      const stage = displayStage(candidate.review_stage);
      const stageMatches = stageFilter === 'All' || stage === stageFilter;
      const searchMatches =
        !query ||
        [candidate.candidate_name, candidate.candidate_email, ...(candidate.matched_skills || [])].some(
          (value) => String(value || '').toLowerCase().includes(query)
        );
      return stageMatches && searchMatches;
    });
  }, [rawCandidates, search, stageFilter]);

  const selection = useCandidateSelection(candidates, { activeJobId, defaultToFirst: true });
  const candidate = selection.selectedCandidate;
  const breakdown = candidate ? computeBreakdown(candidate, activeJob || {}) : null;
  const workflow = useStageWorkflow(activeJobId, candidate);

  const stageCounts = useMemo(
    () =>
      Object.fromEntries(
        FILTER_STAGES.map((stage) => [
          stage,
          stage === 'All'
            ? rawCandidates.length
            : rawCandidates.filter((item) => displayStage(item.review_stage) === stage).length,
        ])
      ),
    [rawCandidates]
  );

  const changeJob = (jobId) => {
    const next = new URLSearchParams(searchParams);
    next.set('jobId', jobId);
    next.delete('candidate');
    next.delete('candidateId');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-7 pb-16 sm:px-8">
      {/* Top Header & Job Controls */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink">Candidates</h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            Review profiles, compare evidence, and move candidates through your hiring process.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-64 max-w-full">
            <Select aria-label="Choose a job" value={activeJobId} onChange={(event) => changeJob(event.target.value)}>
              {!jobs.length && <option value="">No job selected</option>}
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<GitCompare className="h-4 w-4" />}
            onClick={selection.handleInitiateCompare}
            disabled={selection.selectedForCompare.length < 2}
          >
            Compare {selection.selectedForCompare.length ? `(${selection.selectedForCompare.length})` : 'finalists'}
          </Button>
        </div>
      </div>

      {/* Filters: Search bar + Stage Chips */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] max-w-[420px] flex-1">
          <Input
            placeholder="Search by name, email, or skill"
            leftIcon={<Search className="h-4 w-4 text-ink-muted" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Filter candidates by stage">
          {FILTER_STAGES.map((st) => (
            <button
              key={st}
              type="button"
              aria-pressed={stageFilter === st}
              onClick={() => setStageFilter(st)}
              className={`cursor-pointer rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                stageFilter === st
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`}
            >
              {st} <span className="tabular-nums opacity-80">{stageCounts[st]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {jobsLoading || rankingsLoading ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Skeleton className="h-[480px] rounded-[14px]" />
          <Skeleton className="h-[480px] rounded-[14px]" />
        </div>
      ) : !candidates.length ? (
        <div className="flex min-h-[380px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8">
          <EmptyState
            title={rawCandidates.length ? 'No candidates match these filters' : 'No candidates yet'}
            description={
              rawCandidates.length
                ? 'Try another name, skill, or stage.'
                : 'Choose a job and upload resumes to start reviewing candidates.'
            }
            action={!rawCandidates.length ? <Button onClick={() => navigate('/studio/upload')}>Upload resumes</Button> : null}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left Column: Candidate List */}
          <aside className="sticky top-4 flex max-h-[calc(100vh-32px)] flex-col gap-2 overflow-y-auto" aria-label="Candidates">
            <div className="flex items-center justify-between px-1 pb-1">
              <h2 className="text-[13px] font-medium text-ink-muted">Candidate list</h2>
              <span className="text-[12px] tabular-nums text-ink-muted">
                {candidates.length} {candidates.length === 1 ? 'profile' : 'profiles'}
              </span>
            </div>
            {candidates.map((item, index) => {
              const itemBreakdown = computeBreakdown(item, activeJob || {});
              const itemId = item.application_id ?? item.id ?? item.candidate_id;
              return (
                <CandidateListItem
                  key={itemId || index}
                  candidate={item}
                  index={index}
                  selected={String(itemId) === String(selection.effectiveCandidateId)}
                  compared={selection.selectedForCompare.includes(item.application_id)}
                  breakdown={itemBreakdown}
                  onSelect={() => selection.setSelectedCandidateId(itemId)}
                  onToggleCompare={(event) => {
                    event.stopPropagation();
                    selection.handleToggleCompare(item.application_id);
                  }}
                />
              );
            })}
          </aside>

          {/* Right Column: Profile Panel */}
          {candidate && breakdown ? (
            <ProfilePanel
              candidate={candidate}
              activeJob={activeJob}
              breakdown={breakdown}
              selectedIndex={selection.safeSelectedIndex}
              compared={selection.selectedForCompare.includes(candidate.application_id)}
              onToggleCompare={() => selection.handleToggleCompare(candidate.application_id)}
              workflow={workflow}
            />
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8 text-[14px] text-ink-muted">
              Select a candidate to review their profile.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
