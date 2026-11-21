import { useState, useEffect, useMemo } from 'react';
import {
  GitCompare,
  FileText,
  Eye,
  Download,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  SlidersHorizontal,
} from 'lucide-react';
import { Button, Avatar, ScoreBar } from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';
import { downloadResumeFile, previewResumeFile } from '../../api/applications';
import { computeBreakdown } from '../../lib/score';
import PipelineStageControl from './PipelineStageControl';
import EvaluationTab from './tabs/EvaluationTab';
import SkillsTab from './tabs/SkillsTab';
import ActivityTab from './tabs/ActivityTab';

export default function CandidateDetail({
  candidate,
  breakdown: propBreakdown,
  activeJob,
  safeSelectedIndex = 0,
  selectedForCompare = [],
  onToggleCompare,
  stageWorkflow,
  onOpenWeightsTuner,
  dossierTab: propDossierTab,
  setDossierTab: propSetDossierTab,
  className = '',
  // Direct prop fallbacks for maximum compatibility
  onStageButtonClick,
  onConfirmStageUpdate,
  showTransitionPrompt,
  setShowTransitionPrompt,
  targetStage,
  setTargetStage,
  transitionNote,
  setTransitionNote,
  isUpdatingStage = false,
  onAddNote,
  newNoteContent,
  setNewNoteContent,
  isAddingNote = false,
  showAuditTrail,
  setShowAuditTrail,
}) {
  const [internalTab, setInternalTab] = useState('evaluation');
  const [displayScore, setDisplayScore] = useState(0);

  // Fallback to computeBreakdown if propBreakdown is not provided
  const breakdown = useMemo(() => {
    if (propBreakdown) return propBreakdown;
    if (candidate) return computeBreakdown(candidate, activeJob || {});
    return null;
  }, [propBreakdown, candidate, activeJob]);

  // Tab selection
  const dossierTab = propDossierTab || internalTab;
  const setDossierTab = propSetDossierTab || setInternalTab;

  const isEvaluationTab = dossierTab === 'evaluation' || dossierTab === 'scoring';
  const isSkillsTab = dossierTab === 'skills';
  const isActivityTab = dossierTab === 'activity' || dossierTab === 'notes';

  // Smooth cubic ease-out score animation
  useEffect(() => {
    const target = breakdown?.finalScore ?? candidate?.final_score ?? 0;
    if (target === 0) return;
    const duration = 500;
    const startTime = performance.now();
    let animId;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplayScore(target * ease);
      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [breakdown?.finalScore, candidate?.final_score]);

  if (!candidate || !breakdown) return null;

  const notesList = candidate.notes || [];
  const statusHistoryList = candidate.status_history || [];

  const hasExperienceOrEducation = Boolean(
    breakdown?.hasMultiPillar ||
    (breakdown?.experiencePoints > 0 || breakdown?.educationPoints > 0) ||
    (breakdown?.weightExperience > 0 || breakdown?.weightEducation > 0) ||
    candidate?.experience_score !== undefined ||
    candidate?.education_score !== undefined ||
    candidate?.components?.experience ||
    candidate?.components?.education
  );

  // Circumference for 96px circle (r=45, stroke=6)
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(displayScore, 0), 100) / 100);

  // Dynamic recommendation pill
  const finalScoreVal = Number(candidate.final_score ?? breakdown.finalScore ?? 0);
  const recommendation = candidate.recommendation
    ? { label: candidate.recommendation, badge: 'bg-champagne-soft text-ink border-champagne/40' }
    : finalScoreVal >= 80
      ? { label: 'Strong Match', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' }
      : finalScoreVal >= 60
        ? { label: 'Potential Match', badge: 'bg-champagne-soft text-ink border-champagne/40' }
        : finalScoreVal >= 40
          ? { label: 'Moderate Fit', badge: 'bg-surface-alt text-ink-muted border-line' }
          : { label: 'Low Match', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`rounded-[14px] border border-line bg-surface p-5 sm:p-6 shadow-sm space-y-5 animate-fadeIn ${className}`}
    >
      {/* 1. Header with Avatar, Name, Rank Badge, Experience, Seniority & Contact Pills */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-line">
        <div className="flex items-start gap-3.5 min-w-0">
          <Avatar name={cleanCandidateName(candidate.candidate_name)} size="lg" />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold tabular-nums">
                Rank #{candidate.rank || safeSelectedIndex + 1}
              </span>
              <h2 className="text-[22px] font-semibold text-ink tracking-[-0.02em] leading-[1.25] truncate">
                {cleanCandidateName(candidate.candidate_name)}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-muted">
              {candidate.experience_years !== undefined && (
                <span className="inline-flex items-center gap-1 font-medium text-ink">
                  <Briefcase className="w-4 h-4 text-ink-subtle shrink-0" strokeWidth={1.75} />
                  <span className="tabular-nums">{candidate.experience_years} yrs exp</span>
                  {candidate.seniority_level && (
                    <span className="text-ink-muted">({candidate.seniority_level})</span>
                  )}
                </span>
              )}

              {(candidate.education_degree || (candidate.education_level && candidate.education_level !== 'Unspecified')) && (
                <>
                  <span className="text-ink-subtle">·</span>
                  <span className="inline-flex items-center gap-1 text-ink">
                    <GraduationCap className="w-4 h-4 text-ink-subtle shrink-0" strokeWidth={1.75} />
                    <span>{candidate.education_degree || candidate.education_level}</span>
                  </span>
                </>
              )}

              {candidate.candidate_email && (
                <>
                  <span className="text-ink-subtle">·</span>
                  <span className="inline-flex items-center gap-1 text-ink-muted truncate">
                    <Mail className="w-4 h-4 text-ink-subtle shrink-0" strokeWidth={1.75} />
                    <span>{candidate.candidate_email}</span>
                  </span>
                </>
              )}

              {candidate.candidate_phone && (
                <>
                  <span className="text-ink-subtle">·</span>
                  <span className="inline-flex items-center gap-1 text-ink-muted">
                    <Phone className="w-4 h-4 text-ink-subtle shrink-0" strokeWidth={1.75} />
                    <span className="tabular-nums">{candidate.candidate_phone}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions: Weights Tuner link */}
        {onOpenWeightsTuner && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenWeightsTuner}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-champagne" strokeWidth={1.75} />}
            className="text-[12px] shrink-0"
          >
            Tune Weights
          </Button>
        )}
      </div>

      {/* Resume Document Quick Actions (Authenticated Blob Fetch) */}
      {candidate.application_id && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-[10px] bg-surface-alt/40 border border-line text-[13px]">
          <span className="flex items-center gap-2 text-ink-muted">
            <FileText className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
            <span className="font-medium text-ink">Resume Document</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Eye className="w-3.5 h-3.5" strokeWidth={1.75} />}
              onClick={() => previewResumeFile(candidate.application_id)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" strokeWidth={1.75} />}
              onClick={() =>
                downloadResumeFile(
                  candidate.application_id,
                  `${cleanCandidateName(candidate.candidate_name)}_Resume.pdf`
                )
              }
            >
              Download
            </Button>
          </div>
        </div>
      )}

      {/* 2. 96px Animated SVG Score Ring Beside Score Bar & Point-Math Lines */}
      <div className="p-4 rounded-[12px] bg-surface-alt/40 border border-line flex flex-col sm:flex-row items-center gap-5">
        {/* 96px Animated Score Ring */}
        <div className="relative w-24 h-24 shrink-0 flex flex-col items-center justify-center">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            {/* Background Track Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="var(--line)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Foreground Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="var(--champagne)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-75 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[17px] font-semibold text-ink tabular-nums leading-none">
              {displayScore.toFixed(1)}%
            </span>
            <span className="text-[13px] text-ink-muted uppercase tracking-wider mt-0.5 font-medium">
              Score
            </span>
          </div>
        </div>

        {/* Beside: Score Bar and Point-Math Lines */}
        <div className="flex-1 w-full space-y-2.5 text-left">
          <div className="space-y-1">
            <div className="text-[13px] font-medium text-ink flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{hasExperienceOrEducation ? 'Multi-Pillar Point Breakdown' : 'Dual-Track Point Breakdown'}</span>
                <span className={`px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold uppercase tracking-wider ${recommendation.badge}`}>
                  {recommendation.label}
                </span>
              </div>
              <span className="tabular-nums font-semibold text-[13px]">
                {breakdown.finalScore.toFixed(1)} pts
              </span>
            </div>
            <ScoreBar
              skillsPoints={breakdown.skillsCoveredPoints}
              textMatchPoints={breakdown.textMatchPoints}
              experiencePoints={breakdown.experiencePoints}
              educationPoints={breakdown.educationPoints}
              finalScore={breakdown.finalScore}
              hasMultiPillar={hasExperienceOrEducation}
              height="h-2"
            />
          </div>

          {/* Point-Math Lines: 4 lines when experience/education exist (or hasMultiPillar), 2 otherwise */}
          <div data-testid="point-math-lines" className="space-y-1 text-[13px] tabular-nums">
            <div data-testid="math-line-skills" className="flex items-center justify-between text-ink">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Skills ({(breakdown.weightSkills * 100).toFixed(0)}%)</span>
              </span>
              <span className="font-medium">
                {breakdown.weightSkills.toFixed(2)} × {breakdown.skillsCoveredPercent.toFixed(1)}% = {breakdown.skillsCoveredPoints.toFixed(1)} pts
              </span>
            </div>
            <div data-testid="math-line-text" className="flex items-center justify-between text-ink">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>Text ({(breakdown.weightText * 100).toFixed(0)}%)</span>
              </span>
              <span className="font-medium">
                {breakdown.weightText.toFixed(2)} × {breakdown.textMatchPercent.toFixed(1)}% = {breakdown.textMatchPoints.toFixed(1)} pts
              </span>
            </div>

            {hasExperienceOrEducation && (
              <>
                <div data-testid="math-line-experience" className="flex items-center justify-between text-ink">
                  <span className="flex items-center gap-1.5 text-ink-muted">
                    <span className="w-2 h-2 rounded-full bg-ink-muted" />
                    <span>Experience ({(breakdown.weightExperience * 100).toFixed(0)}%)</span>
                  </span>
                  <span className="font-medium">
                    {breakdown.weightExperience.toFixed(2)} × {breakdown.experiencePercent.toFixed(1)}% = {breakdown.experiencePoints.toFixed(1)} pts
                  </span>
                </div>
                <div data-testid="math-line-education" className="flex items-center justify-between text-ink">
                  <span className="flex items-center gap-1.5 text-ink-muted">
                    <span className="w-2 h-2 rounded-full bg-champagne/40" />
                    <span>Education ({(breakdown.weightEducation * 100).toFixed(0)}%)</span>
                  </span>
                  <span className="font-medium">
                    {breakdown.weightEducation.toFixed(2)} × {breakdown.educationPercent.toFixed(1)}% = {breakdown.educationPoints.toFixed(1)} pts
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Embedded Pipeline Stage Control */}
      <PipelineStageControl
        candidate={candidate}
        stageWorkflow={stageWorkflow}
        onStageButtonClick={onStageButtonClick}
        onConfirmStageUpdate={onConfirmStageUpdate}
        showTransitionPrompt={showTransitionPrompt}
        setShowTransitionPrompt={setShowTransitionPrompt}
        targetStage={targetStage}
        setTargetStage={setTargetStage}
        transitionNote={transitionNote}
        setTransitionNote={setTransitionNote}
        isUpdatingStage={isUpdatingStage}
      />

      {/* 4. Horizontal Navigation Tabs Shell */}
      <div className="flex items-center gap-1 border-b border-line">
        <button
          type="button"
          onClick={() => setDossierTab('evaluation')}
          className={`py-2 px-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
            isEvaluationTab
              ? 'border-primary text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Evaluation & Math
        </button>
        <button
          type="button"
          onClick={() => setDossierTab('skills')}
          className={`py-2 px-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
            isSkillsTab
              ? 'border-primary text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Required Skills ({activeJob?.required_skills?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setDossierTab('activity')}
          className={`py-2 px-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            isActivityTab
              ? 'border-primary text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <span>Notes & Activity</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-alt border border-line text-[11px] font-semibold tabular-nums text-ink-muted">
            {notesList.length + statusHistoryList.length}
          </span>
        </button>
      </div>

      {/* 5. Tab Panels */}
      <div className={isEvaluationTab ? 'block' : 'hidden'}>
        <EvaluationTab candidate={candidate} breakdown={breakdown} />
      </div>

      <div className={isSkillsTab ? 'block' : 'hidden'}>
        <SkillsTab candidate={candidate} activeJob={activeJob} />
      </div>

      <div className={isActivityTab ? 'block' : 'hidden'}>
        <ActivityTab
          candidate={candidate}
          stageWorkflow={stageWorkflow}
          notesList={notesList}
          statusHistoryList={statusHistoryList}
          onAddNote={onAddNote}
          newNoteContent={newNoteContent}
          setNewNoteContent={setNewNoteContent}
          isAddingNote={isAddingNote}
          showAuditTrail={showAuditTrail}
          setShowAuditTrail={setShowAuditTrail}
        />
      </div>

      {/* 6. Compare Footer */}
      <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
        {onToggleCompare && (
          <Button
            variant={
              selectedForCompare.includes(candidate.application_id)
                ? 'secondary'
                : 'primary'
            }
            size="sm"
            leftIcon={<GitCompare className="w-4 h-4" strokeWidth={1.75} />}
            onClick={() => onToggleCompare(candidate.application_id)}
          >
            {selectedForCompare.includes(candidate.application_id)
              ? 'Remove from compare'
              : 'Add to compare'}
          </Button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-ink-muted ml-auto">
          <span>Use</span>
          <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface-alt border border-line text-[13px]">
            ↑
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface-alt border border-line text-[13px]">
            ↓
          </kbd>
          <span>to browse</span>
        </div>
      </div>
    </div>
  );
}
