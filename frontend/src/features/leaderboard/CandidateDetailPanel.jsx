import { useState, useEffect } from 'react';
import { GitCompare, FileText, Eye, Download } from 'lucide-react';
import { Button, Avatar, ScoreBar } from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';
import { downloadResumeFile, previewResumeFile } from '../../api/applications';
import CandidatePipelineHeader from './CandidatePipelineHeader';
import CandidateEvaluationTab from './CandidateEvaluationTab';
import CandidateSkillsTab from './CandidateSkillsTab';
import CandidateActivityTab from './CandidateActivityTab';

export default function CandidateDetailPanel({
  candidate,
  breakdown,
  activeJob,
  safeSelectedIndex = 0,
  selectedForCompare = [],
  onToggleCompare,
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
  dossierTab = 'scoring',
  setDossierTab,
  showAuditTrail,
  setShowAuditTrail,
}) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const target = breakdown?.finalScore || 0;
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
  }, [breakdown?.finalScore]);

  if (!candidate || !breakdown) return null;

  const notesList = candidate.notes || [];
  const statusHistoryList = candidate.status_history || [];

  // Circumference for 96px circle (r=45, stroke=6)
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(displayScore, 0), 100) / 100);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sticky top-20 rounded-[14px] border border-line bg-surface p-5 sm:p-6 shadow-sm space-y-5 animate-fadeIn"
    >
      {/* 1. Header with Avatar, Name, Rank Badge */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <Avatar name={cleanCandidateName(candidate.candidate_name)} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold tabular-nums">
                Rank #{candidate.rank || safeSelectedIndex + 1}
              </span>
              <h2 className="text-[22px] font-semibold text-ink tracking-[-0.02em] leading-[1.25]">
                {cleanCandidateName(candidate.candidate_name)}
              </h2>
            </div>
            <div className="text-[13px] text-ink-muted mt-0.5">
              {candidate.candidate_email || '—'}
            </div>
          </div>
        </div>
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

      {/* 2. 96px Animated SVG Score Ring Beside Two-Segment Score Bar & Point-Math Lines */}
      <div className="p-4 rounded-[12px] bg-surface-alt/40 border border-line flex flex-col sm:flex-row items-center gap-5">
        {/* 96px Animated Score Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
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

        {/* Beside: Two-Segment Score Bar and Two Point-Math Lines */}
        <div className="flex-1 w-full space-y-2.5 text-left">
          <div className="space-y-1">
            <div className="text-[13px] font-medium text-ink flex items-center justify-between">
              <span>Dual-Track Point Breakdown</span>
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
              height="h-2"
            />
          </div>

          {/* Two Point-Math Lines */}
          <div className="space-y-1 text-[13px] tabular-nums">
            <div className="flex items-center justify-between text-ink">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Skills ({(breakdown.weightSkills * 100).toFixed(0)}%)</span>
              </span>
              <span className="font-medium">
                {breakdown.weightSkills.toFixed(2)} × {breakdown.skillsCoveredPercent.toFixed(1)}% = {breakdown.skillsCoveredPoints.toFixed(1)} pts
              </span>
            </div>
            <div className="flex items-center justify-between text-ink">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>Text ({(breakdown.weightText * 100).toFixed(0)}%)</span>
              </span>
              <span className="font-medium">
                {breakdown.weightText.toFixed(2)} × {breakdown.textMatchPercent.toFixed(1)}% = {breakdown.textMatchPoints.toFixed(1)} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pipeline Header (Stage controls and transitions) */}
      <CandidatePipelineHeader
        candidate={candidate}
        breakdown={breakdown}
        safeSelectedIndex={safeSelectedIndex}
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

      {/* 4. Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-line">
        <button
          type="button"
          onClick={() => setDossierTab('scoring')}
          className={`py-2 px-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
            dossierTab === 'scoring'
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
            dossierTab === 'skills'
              ? 'border-primary text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Required Skills ({activeJob?.required_skills?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setDossierTab('notes')}
          className={`py-2 px-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
            dossierTab === 'notes'
              ? 'border-primary text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Notes & Activity ({notesList.length + statusHistoryList.length})
        </button>
      </div>

      {/* 5. Tab Panels */}
      <div className={dossierTab === 'scoring' ? 'block' : 'hidden'}>
        <CandidateEvaluationTab candidate={candidate} breakdown={breakdown} />
      </div>

      <div className={dossierTab === 'skills' ? 'block' : 'hidden'}>
        <CandidateSkillsTab candidate={candidate} activeJob={activeJob} />
      </div>

      <div className={dossierTab === 'notes' ? 'block' : 'hidden'}>
        <CandidateActivityTab
          candidate={candidate}
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

        <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-ink-muted">
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
