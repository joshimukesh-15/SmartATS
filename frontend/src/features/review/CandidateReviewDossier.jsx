import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  GitCompare,
} from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { cleanCandidateName } from '../../lib/format';
import ReviewPipeline from './ReviewPipeline';
import ReviewEvaluationTab from './ReviewEvaluationTab';
import ReviewSkillsTab from './ReviewSkillsTab';
import ReviewNotesTimeline from './ReviewNotesTimeline';

export default function CandidateReviewDossier({
  candidate,
  breakdown,
  activeJob,
  dossierTab,
  setDossierTab,
  onStageChange,
  isStageUpdating,
  newNote,
  setNewNote,
  onAddNote,
  isAddingNote,
  onCompareCandidate,
}) {
  if (!candidate || !breakdown) {
    return (
      <Panel className="p-8 sm:p-12 text-center text-ink-muted text-[13px]">
        Select a candidate from the roster on the left to view their detailed review dossier.
      </Panel>
    );
  }

  return (
    <Panel className="p-5 sm:p-6 space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-line">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold tabular-nums">
              Rank #{candidate.rank || 1}
            </span>
            <h2 className="text-[22px] font-semibold text-ink tracking-[-0.02em] leading-[1.25] truncate">
              {cleanCandidateName(candidate.candidate_name)}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
              <span className="tabular-nums">{candidate.experience_years || 0} yrs exp</span> (
              {candidate.seniority_level || 'Junior / Entry'})
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
              {candidate.education_degree ||
                candidate.education_level ||
                'Degree'}
            </span>
            {candidate.candidate_email && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                  <span>{candidate.candidate_email}</span>
                </span>
              </>
            )}
            {candidate.candidate_phone && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                  <span className="tabular-nums">{candidate.candidate_phone}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Final Score Hero Card */}
        <div className="px-5 py-3 rounded-[12px] bg-surface-alt border border-line text-right shrink-0">
          <span className="text-[13px] text-ink-muted block uppercase tracking-wider font-medium">
            Final score
          </span>
          <span className="text-[28px] font-bold text-ink tabular-nums leading-tight">
            {breakdown.finalScore.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Recruitment Pipeline Stepper Ribbon */}
      <ReviewPipeline
        candidate={candidate}
        onStageChange={onStageChange}
        isPending={isStageUpdating}
      />

      {/* Dossier Tabs: Evaluation & Math | Required Skills | Notes & Activity */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-6 border-b border-line text-[14px]">
          <button
            type="button"
            onClick={() => setDossierTab('scoring')}
            className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
              dossierTab === 'scoring'
                ? 'text-ink border-b-2 border-primary font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Evaluation & Math
          </button>
          <button
            type="button"
            onClick={() => setDossierTab('skills')}
            className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
              dossierTab === 'skills'
                ? 'text-ink border-b-2 border-primary font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Required Skills (
            <span className="tabular-nums">{activeJob?.required_skills?.length || 0}</span>)
          </button>
          <button
            type="button"
            onClick={() => setDossierTab('notes')}
            className={`pb-2.5 font-medium transition-colors cursor-pointer relative ${
              dossierTab === 'notes'
                ? 'text-ink border-b-2 border-primary font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Notes & Activity (
            <span className="tabular-nums">
              {(candidate.notes?.length || 0) +
                (candidate.status_history?.length || 0)}
            </span>)
          </button>
        </div>

        {/* TAB 1: Evaluation & Multi-Pillar Math */}
        {dossierTab === 'scoring' && (
          <ReviewEvaluationTab candidate={candidate} breakdown={breakdown} />
        )}

        {/* TAB 2: Required Skills & Equivalents */}
        {dossierTab === 'skills' && (
          <ReviewSkillsTab candidate={candidate} activeJob={activeJob} />
        )}

        {/* TAB 3: Notes & Activity */}
        {dossierTab === 'notes' && (
          <ReviewNotesTimeline
            candidate={candidate}
            newNote={newNote}
            setNewNote={setNewNote}
            onAddNote={onAddNote}
            isAddingNote={isAddingNote}
          />
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="pt-4 border-t border-line flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<GitCompare className="w-4 h-4" strokeWidth={1.75} />}
          onClick={() => onCompareCandidate(candidate.application_id)}
        >
          Compare Candidate
        </Button>
        <span className="text-[13px] text-ink-subtle">
          Application ID: <span className="tabular-nums">{candidate.application_id}</span>
        </span>
      </div>
    </Panel>
  );
}
