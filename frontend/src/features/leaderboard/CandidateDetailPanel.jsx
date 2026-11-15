import { GitCompare } from 'lucide-react';
import { Button } from '../../components/ui';
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
  if (!candidate || !breakdown) return null;

  const notesList = candidate.notes || [];
  const statusHistoryList = candidate.status_history || [];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Executive Header & Pipeline */}
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

      {/* 2. Horizontal Navigation Tabs */}
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

      {/* 3. Tab Panels */}
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

      {/* 4. Compare Footer */}
      <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
        <Button
          variant={
            selectedForCompare.includes(candidate.application_id)
              ? 'secondary'
              : 'primary'
          }
          size="sm"
          leftIcon={<GitCompare className="w-3.5 h-3.5" />}
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
