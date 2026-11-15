import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  Minus,
  Search,
  RotateCcw,
  ArrowRight,
  GitCompare,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  useJobs,
  useRankings,
  useUpdateApplicationStage,
  useAddApplicationNote,
} from '../../hooks';
import { computeBreakdown } from '../../lib/score';
import { cleanCandidateName } from '../../lib/format';
import { Panel } from '../../components/ui/Panel';
import { Badge } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { ScoreBar } from '../../components/ui/ScoreBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

const STAGES = ['New', 'Reviewing', 'Interview', 'Hired'];

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId');
  const urlCandidateId = searchParams.get('candidateId');

  // Job selection
  const { data: jobsList = [], isLoading: jobsLoading } = useJobs();
  const activeJobId = urlJobId ? Number(urlJobId) : jobsList[0]?.job_id || null;

  const handleSelectJob = (id) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('jobId', id);
      p.delete('candidateId');
      return p;
    });
  };

  // Candidates for active job
  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
    refetch,
  } = useRankings(activeJobId);

  const rawCandidates = useMemo(
    () => rankingsData?.rankings || [],
    [rankingsData?.rankings]
  );

  // Active candidate selection
  const [selectedCandidateId, setSelectedCandidateId] = useState(urlCandidateId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [dossierTab, setDossierTab] = useState('scoring'); // 'scoring' | 'skills' | 'notes'
  const [newNote, setNewNote] = useState('');

  // Active Job details
  const activeJob = useMemo(
    () => jobsList.find((j) => j.job_id === activeJobId),
    [jobsList, activeJobId]
  );

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let list = [...rawCandidates];
    if (stageFilter !== 'ALL') {
      list = list.filter((c) => (c.review_stage || 'New') === stageFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.candidate_name?.toLowerCase().includes(q) ||
          c.candidate_email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rawCandidates, stageFilter, searchQuery]);

  // Sync candidate selection to URL
  const handleSelectCandidate = useCallback(
    (appId) => {
      setSelectedCandidateId(appId);
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set('candidateId', appId);
        return p;
      });
    },
    [setSearchParams]
  );

  // Derive active candidate
  const effectiveCandidateId = useMemo(() => {
    if (
      selectedCandidateId &&
      filteredCandidates.some((c) => c.application_id === selectedCandidateId)
    ) {
      return selectedCandidateId;
    }
    return filteredCandidates[0]?.application_id || null;
  }, [selectedCandidateId, filteredCandidates]);

  const selectedCandidate = useMemo(
    () => rawCandidates.find((c) => c.application_id === effectiveCandidateId),
    [rawCandidates, effectiveCandidateId]
  );

  const selectedBreakdown = useMemo(() => {
    if (!selectedCandidate) return null;
    return computeBreakdown(selectedCandidate, activeJob);
  }, [selectedCandidate, activeJob]);

  // Stage mutation
  const stageMutation = useUpdateApplicationStage(activeJobId);
  const noteMutation = useAddApplicationNote(activeJobId);

  const handleStageChange = async (targetStage, noteText = '') => {
    if (!selectedCandidate) return;
    try {
      await stageMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        stage: targetStage,
        note: noteText || `Stage moved to ${targetStage} in Candidate Review`,
        changed_by: 'Recruiter',
      });
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedCandidate) return;
    try {
      await noteMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        content: newNote.trim(),
        author: 'Recruiter',
      });
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
      if (filteredCandidates.length <= 1) return;

      const idx = filteredCandidates.findIndex(
        (c) => c.application_id === effectiveCandidateId
      );
      if (idx === -1) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (idx + 1) % filteredCandidates.length;
        handleSelectCandidate(filteredCandidates[nextIdx].application_id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx =
          (idx - 1 + filteredCandidates.length) % filteredCandidates.length;
        handleSelectCandidate(filteredCandidates[prevIdx].application_id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCandidates, effectiveCandidateId, handleSelectCandidate]);

  return (
    <div className="space-y-6">
      {/* Top Header & Job Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-[22px] font-semibold text-ink tracking-tight">
            Candidate Review
          </h1>
          <p className="text-[13px] text-ink-muted">
            Auditable candidate evaluation, multi-factor scoring breakdown, and stage pipeline.
          </p>
        </div>

        {/* Job selector & quick actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeJobId || ''}
              onChange={(e) => handleSelectJob(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 rounded-[10px] border border-line bg-surface text-ink text-[13px] font-medium hover:border-primary transition-colors cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-primary"
            >
              {jobsList.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-ink-muted pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <Link
            to={activeJobId ? `/studio/leaderboard?jobId=${activeJobId}` : '/studio/leaderboard'}
            className="px-3.5 py-2 rounded-[10px] border border-line bg-surface hover:bg-surface-alt text-[13px] font-medium text-ink transition-colors flex items-center gap-1.5"
          >
            <span>View Rankings</span>
            <ArrowRight className="w-3.5 h-3.5 text-ink-subtle" />
          </Link>
        </div>
      </div>

      {/* Main 2-Column Review Layout */}
      {jobsLoading || rankingsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : rankingsError ? (
        <Panel className="p-8 text-center space-y-4">
          <p className="text-danger text-[14px]">Failed to load candidates for review.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Panel>
      ) : rawCandidates.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No candidates yet"
          description="Upload resumes for this job opening to begin evaluating applicants."
          actionLabel="Upload Resumes"
          onAction={() =>
            navigate(activeJobId ? `/studio/upload?jobId=${activeJobId}` : '/studio/upload')
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Candidate Roster & Quick Filters (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search & Stage Filter Strip */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] rounded-[10px] border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Stage Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[13px] no-scrollbar">
                {['ALL', ...STAGES, 'Rejected'].map((stage) => {
                  const count =
                    stage === 'ALL'
                      ? rawCandidates.length
                      : rawCandidates.filter((c) => (c.review_stage || 'New') === stage)
                          .length;
                  const active = stageFilter === stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setStageFilter(stage)}
                      className={`px-2.5 py-1 rounded-[8px] border text-[12px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-line bg-surface hover:bg-surface-alt text-ink-muted'
                      }`}
                    >
                      {stage} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate List Cards */}
            <Panel className="p-2 max-h-[calc(100vh-16rem)] overflow-y-auto divide-y divide-line/40">
              {filteredCandidates.length === 0 ? (
                <div className="p-6 text-center text-ink-muted text-[13px]">
                  No candidates match the filter.
                </div>
              ) : (
                filteredCandidates.map((candidate, idx) => {
                  const isSelected = candidate.application_id === selectedCandidateId;
                  const bd = computeBreakdown(candidate, activeJob);
                  const stage = candidate.review_stage || 'New';

                  return (
                    <div
                      key={candidate.application_id}
                      onClick={() => handleSelectCandidate(candidate.application_id)}
                      className={`p-3 rounded-[10px] cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-alt border border-line shadow-xs'
                          : 'hover:bg-surface-alt/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] tabular-nums font-semibold text-ink-muted">
                              #{candidate.rank || idx + 1}
                            </span>
                            <span className="text-[14px] font-medium text-ink truncate">
                              {cleanCandidateName(candidate.candidate_name)}
                            </span>
                          </div>
                          <div className="text-[12px] text-ink-muted mt-0.5 flex items-center gap-1.5 truncate">
                            <span>{candidate.experience_years || 0} yrs exp</span>
                            <span>·</span>
                            <span>{candidate.seniority_level || 'Mid-Level'}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="text-[13px] font-semibold text-ink tabular-nums">
                            {bd.finalScore.toFixed(1)}%
                          </span>
                          <div>
                            <Badge
                              variant={
                                stage === 'Hired'
                                  ? 'champagne'
                                  : stage === 'Rejected'
                                    ? 'danger'
                                    : 'secondary'
                              }
                              className="text-[11px] px-1.5 py-0.5"
                            >
                              {stage}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </Panel>

            <div className="text-[12px] text-ink-subtle text-center">
              Use <kbd className="px-1.5 py-0.5 rounded-[4px] border border-line bg-surface-alt">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded-[4px] border border-line bg-surface-alt">↓</kbd> to browse candidates
            </div>
          </div>

          {/* RIGHT: Full Candidate Review Dossier (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedCandidate && selectedBreakdown ? (
              <Panel className="p-6 space-y-6">
                {/* Executive Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-line">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[6px] bg-primary text-on-primary text-[12px] font-semibold">
                        Rank #{selectedCandidate.rank || 1}
                      </span>
                      <h2 className="text-[20px] font-semibold text-ink truncate">
                        {cleanCandidateName(selectedCandidate.candidate_name)}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-ink-subtle" />
                        {selectedCandidate.experience_years || 0} yrs exp (
                        {selectedCandidate.seniority_level || 'Junior / Entry'})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-ink-subtle" />
                        {selectedCandidate.education_degree ||
                          selectedCandidate.education_level ||
                          'Degree'}
                      </span>
                      {selectedCandidate.candidate_email && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3.5 h-3.5 text-ink-subtle" />
                            {selectedCandidate.candidate_email}
                          </span>
                        </>
                      )}
                      {selectedCandidate.candidate_phone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                            {selectedCandidate.candidate_phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Final Score Hero Card */}
                  <div className="px-5 py-3 rounded-[12px] bg-surface-alt border border-line text-right shrink-0">
                    <span className="text-[12px] text-ink-muted block uppercase tracking-wider font-medium">
                      Final score
                    </span>
                    <span className="text-[28px] font-bold text-ink tabular-nums leading-tight">
                      {selectedBreakdown.finalScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Recruitment Pipeline Stepper Ribbon */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-ink">Recruitment Stage</span>
                    <div className="flex items-center gap-2">
                      {selectedCandidate.review_stage === 'Rejected' ? (
                        <button
                          type="button"
                          onClick={() => handleStageChange('Reviewing', 'Candidate reopened for review')}
                          className="text-[12px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen candidate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStageChange('Rejected', 'Candidate rejected during review')}
                          className="px-2.5 py-1 rounded-[8px] border border-line bg-surface hover:bg-danger/10 hover:border-danger hover:text-danger text-[12px] text-ink-muted transition-colors cursor-pointer"
                        >
                          Mark Rejected
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Segmented Pipeline Stepper */}
                  <div className="grid grid-cols-4 gap-2 bg-surface-alt/70 p-1.5 rounded-[12px] border border-line">
                    {STAGES.map((s, idx) => {
                      const currentStage = selectedCandidate.review_stage || 'New';
                      const currentIdx = STAGES.indexOf(currentStage);
                      const isCurrent = currentStage === s;
                      const isCompleted = currentIdx > idx && currentStage !== 'Rejected';

                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStageChange(s)}
                          disabled={stageMutation.isPending}
                          className={`relative py-2.5 px-3 rounded-[10px] text-center transition-all cursor-pointer select-none ${
                            isCurrent
                              ? 'bg-primary text-on-primary font-semibold shadow-xs'
                              : isCompleted
                                ? 'bg-surface text-ink font-medium hover:bg-surface-alt'
                                : 'text-ink-muted hover:bg-surface/50'
                          }`}
                        >
                          <div className="text-[13px] leading-tight flex items-center justify-center gap-1.5">
                            {isCompleted && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-champagne shrink-0" />
                            )}
                            <span className="truncate">{s}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                      Required Skills ({activeJob?.required_skills?.length || 0})
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
                      {(selectedCandidate.notes?.length || 0) +
                        (selectedCandidate.status_history?.length || 0)}
                      )
                    </button>
                  </div>

                  {/* TAB 1: Evaluation & Multi-Pillar Math */}
                  {dossierTab === 'scoring' && (
                    <div className="space-y-4">
                      {/* Overall Progress Bar */}
                      <div className="p-4 rounded-[12px] bg-surface-alt/50 border border-line space-y-2">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-ink">
                            Multi-Pillar Score Progress
                          </span>
                          <span className="tabular-nums font-bold text-ink text-[14px]">
                            {selectedBreakdown.finalScore.toFixed(1)}%
                          </span>
                        </div>
                        <ScoreBar
                          skillsPoints={selectedBreakdown.skillsCoveredPoints}
                          textMatchPoints={selectedBreakdown.textMatchPoints}
                          experiencePoints={selectedBreakdown.experiencePoints}
                          educationPoints={selectedBreakdown.educationPoints}
                          finalScore={selectedBreakdown.finalScore}
                          height="h-2.5"
                        />
                      </div>

                      {/* 2x2 Pillar Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              Skills Coverage ({Math.round((selectedBreakdown.weightSkills ?? 0.40) * 100)}%)
                            </span>
                            <span className="text-[12px] tabular-nums">
                              {selectedBreakdown.skillsCoveredPercent.toFixed(1)}% match
                            </span>
                          </div>
                          <div className="text-[16px] font-bold text-ink tabular-nums">
                            {selectedBreakdown.skillsCoveredPoints.toFixed(1)} pts
                          </div>
                        </div>

                        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-champagne" />
                              Semantic Text ({Math.round((selectedBreakdown.weightText ?? 0.20) * 100)}%)
                            </span>
                            <span className="text-[12px] tabular-nums">
                              {selectedBreakdown.textMatchPercent.toFixed(1)}% match
                            </span>
                          </div>
                          <div className="text-[16px] font-bold text-ink tabular-nums">
                            {selectedBreakdown.textMatchPoints.toFixed(1)} pts
                          </div>
                        </div>

                        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-ink-muted" />
                              Experience Fit ({Math.round((selectedBreakdown.weightExperience ?? 0.25) * 100)}%)
                            </span>
                            <span className="text-[12px] tabular-nums">
                              {selectedBreakdown.experiencePercent.toFixed(1)}% score
                            </span>
                          </div>
                          <div className="text-[16px] font-bold text-ink tabular-nums">
                            {selectedBreakdown.experiencePoints.toFixed(1)} pts
                          </div>
                        </div>

                        <div className="p-3.5 rounded-[12px] border border-line bg-surface space-y-1">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-champagne/70" />
                              Education ({Math.round((selectedBreakdown.weightEducation ?? 0.15) * 100)}%)
                            </span>
                            <span className="text-[12px] tabular-nums">
                              {selectedBreakdown.educationPercent.toFixed(1)}% credential
                            </span>
                          </div>
                          <div className="text-[16px] font-bold text-ink tabular-nums">
                            {selectedBreakdown.educationPoints.toFixed(1)} pts
                          </div>
                        </div>
                      </div>

                      {/* Auditable Math Explanation */}
                      {selectedCandidate.score_explanation && (
                        <div className="p-4 rounded-[12px] bg-surface-alt/40 border border-line space-y-2 text-[13px]">
                          <div className="font-semibold text-ink flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-champagne" />
                            <span>Transparent Math Formula & Audit</span>
                          </div>
                          <p className="text-ink-muted leading-relaxed whitespace-pre-line">
                            {selectedCandidate.score_explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Required Skills & Equivalents */}
                  {dossierTab === 'skills' && (
                    <div className="space-y-3">
                      {(activeJob?.required_skills || []).map((req) => {
                        const isMatched = (selectedCandidate.matched_skills || []).includes(req);
                        const equivalent = selectedCandidate.equivalent_skills?.[req];

                        return (
                          <div
                            key={req}
                            className="p-3 rounded-[10px] border border-line bg-surface flex items-center justify-between text-[13px]"
                          >
                            <span className="font-medium text-ink">{req}</span>
                            <div>
                              {isMatched ? (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne" />
                                  <span>Matched</span>
                                </Badge>
                              ) : equivalent ? (
                                <Badge variant="champagne" className="flex items-center gap-1">
                                  <span>{equivalent} (Equiv · 75%)</span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex items-center gap-1 text-ink-subtle">
                                  <Minus className="w-3.5 h-3.5" />
                                  <span>Missing</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {selectedCandidate.preferred_matched_skills?.length > 0 && (
                        <div className="pt-3 border-t border-line space-y-2">
                          <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider">
                            Preferred Skills Found
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCandidate.preferred_matched_skills.map((s) => (
                              <Badge key={s} variant="secondary">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Notes & Activity */}
                  {dossierTab === 'notes' && (
                    <div className="space-y-4">
                      {/* Add Note Form */}
                      <form onSubmit={handleAddNote} className="space-y-2">
                        <textarea
                          placeholder="Add recruiter interview feedback or screening note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={3}
                          className="w-full p-3 text-[13px] rounded-[10px] border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            size="sm"
                            variant="primary"
                            disabled={!newNote.trim() || noteMutation.isPending}
                          >
                            {noteMutation.isPending ? 'Saving...' : 'Add Note'}
                          </Button>
                        </div>
                      </form>

                      {/* Notes list */}
                      <div className="space-y-2.5">
                        {(selectedCandidate.notes || []).map((n) => (
                          <div
                            key={n.note_id}
                            className="p-3.5 rounded-[10px] bg-surface border border-line space-y-1 text-[13px]"
                          >
                            <div className="flex items-center justify-between text-[12px] text-ink-subtle">
                              <span className="font-semibold text-ink">{n.author}</span>
                              <span className="tabular-nums">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-ink leading-relaxed">{n.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Stage History */}
                      {(selectedCandidate.status_history || []).length > 0 && (
                        <div className="pt-3 border-t border-line space-y-2">
                          <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider">
                            Stage History Audit
                          </span>
                          <div className="space-y-2 text-[12px]">
                            {selectedCandidate.status_history.map((h) => (
                              <div
                                key={h.history_id}
                                className="flex items-center justify-between text-ink-muted"
                              >
                                <span>
                                  Stage changed from <strong className="text-ink">{h.from_stage}</strong>{' '}
                                  to <strong className="text-ink">{h.to_stage}</strong>
                                </span>
                                <span className="tabular-nums text-ink-subtle">
                                  {new Date(h.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Quick Action */}
                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<GitCompare className="w-3.5 h-3.5" />}
                    onClick={() =>
                      navigate(
                        `/studio/compare?jobId=${activeJobId}&app1=${selectedCandidate.application_id}`
                      )
                    }
                  >
                    Compare Candidate
                  </Button>
                  <span className="text-[12px] text-ink-subtle">
                    Application ID: {selectedCandidate.application_id}
                  </span>
                </div>
              </Panel>
            ) : (
              <Panel className="p-12 text-center text-ink-muted text-[13px]">
                Select a candidate from the roster on the left to view their detailed review dossier.
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
