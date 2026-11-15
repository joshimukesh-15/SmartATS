import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  GitCompare,
  Search,
  Check,
  Minus,
  Mail,
  Phone,
  Clock,
  SlidersHorizontal,
  Briefcase,
  GraduationCap,
  RotateCcw,
  ChevronDown,
  Columns2,
  Table as TableIcon,
} from 'lucide-react';
import {
  useJobs,
  useRankings,
  useUpdateApplicationStage,
  useAddApplicationNote,
  useUpdateJobWeights,
} from '../../hooks';
import {
  Select,
  Input,
  Button,
  ScoreBar,
  ScoreValue,
  Panel,
  EmptyState,
  Skeleton,
  Dialog,
  Drawer,
  toast,
} from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';
import { computeBreakdown, sortCandidates } from '../../lib/score';
import { getExportCsvUrl } from '../../api';

const STAGES = ['New', 'Reviewing', 'Interview', 'Hired', 'Rejected'];

const STAGE_CONFIG = {
  New: {
    label: 'New',
    badge: 'bg-surface-alt text-ink-muted border border-line',
  },
  Reviewing: {
    label: 'Reviewing',
    badge: 'bg-champagne-soft text-ink font-medium border border-champagne/40',
  },
  Interview: {
    label: 'Interview',
    badge: 'bg-primary/10 text-primary font-semibold border border-primary/30',
  },
  Hired: {
    label: 'Hired',
    badge: 'bg-champagne text-ink font-semibold',
  },
  Rejected: {
    label: 'Rejected',
    badge: 'bg-surface-alt/60 text-ink-subtle line-through border border-line/60',
  },
};

export default function LeaderboardPage() {
  const { jobId: routeJobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  // Active Job ID
  const activeJobId = routeJobId || (jobs.length > 0 ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((j) => String(j.job_id) === String(activeJobId));

  // Recruiter Scoring Weights State
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [appliedWeights, setAppliedWeights] = useState(null);
  const [weightValues, setWeightValues] = useState({
    weight_skills: 0.40,
    weight_text: 0.20,
    weight_experience: 0.25,
    weight_education: 0.15,
  });

  // Sync weights when active job changes
  const [prevJobId, setPrevJobId] = useState(activeJobId);
  if (prevJobId !== activeJobId) {
    setPrevJobId(activeJobId);
    setAppliedWeights(null);
    if (activeJob?.custom_weights) {
      setWeightValues({
        weight_skills: activeJob.custom_weights.weight_skills ?? 0.40,
        weight_text: activeJob.custom_weights.weight_text ?? 0.20,
        weight_experience: activeJob.custom_weights.weight_experience ?? 0.25,
        weight_education: activeJob.custom_weights.weight_education ?? 0.15,
      });
    } else {
      setWeightValues({
        weight_skills: 0.40,
        weight_text: 0.20,
        weight_experience: 0.25,
        weight_education: 0.15,
      });
    }
  }

  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(activeJobId, appliedWeights);
  const updateStageMutation = useUpdateApplicationStage(activeJobId);
  const addNoteMutation = useAddApplicationNote(activeJobId);
  const updateWeightsMutation = useUpdateJobWeights(activeJobId);

  // Search & Stage Filter state
  const [search, setSearch] = useState('');
  const initialStage = searchParams.get('stage');
  const [stageFilter, setStageFilter] = useState(
    initialStage && STAGES.includes(initialStage) ? initialStage : 'All'
  );
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected candidate index
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Multi-candidate comparison selection
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // Layout mode & Dossier navigation
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'table'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState('scoring'); // 'scoring' | 'skills' | 'notes'
  const [openStageMenuId, setOpenStageMenuId] = useState(null);

  // Workflow UI state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showTransitionPrompt, setShowTransitionPrompt] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [transitionNote, setTransitionNote] = useState('');
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  // Mobile detail dialog
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const tableContainerRef = useRef(null);

  // Raw candidates list from API
  const rawCandidates = useMemo(() => {
    return rankingsData?.rankings || [];
  }, [rankingsData]);

  // Filtered and sorted candidate list
  const candidates = useMemo(() => {
    let list = rawCandidates;
    if (stageFilter !== 'All') {
      list = list.filter((c) => (c.review_stage || 'New') === stageFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.candidate_name?.toLowerCase().includes(q) ||
          c.candidate_email?.toLowerCase().includes(q) ||
          c.matched_skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return sortCandidates(list, sortBy, sortOrder);
  }, [rawCandidates, stageFilter, search, sortBy, sortOrder]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, candidates.length - 1));

  // Keyboard navigation for Master-Detail (Up/Down arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, candidates.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidates.length]);

  const selectedCandidate = candidates[safeSelectedIndex] || null;
  const selectedBreakdown = selectedCandidate
    ? computeBreakdown(selectedCandidate, activeJob)
    : null;

  const currentCandidateStage = selectedCandidate?.review_stage || 'New';
  const notesList = selectedCandidate?.notes || [];
  const statusHistoryList = selectedCandidate?.status_history || [];

  const handleJobChange = (newJobId) => {
    navigate(`/studio/leaderboard/${newJobId}`);
    setSelectedForCompare([]);
    setSelectedIndex(0);
    setShowTransitionPrompt(false);
  };

  const handleToggleCompare = (appId) => {
    if (selectedForCompare.includes(appId)) {
      setSelectedForCompare((prev) => prev.filter((id) => id !== appId));
    } else {
      if (selectedForCompare.length >= 5) {
        toast.error('Maximum of 5 candidates can be compared simultaneously.');
        return;
      }
      setSelectedForCompare((prev) => [...prev, appId]);
    }
  };

  const handleInitiateCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 candidates to compare');
      return;
    }
    const params = new URLSearchParams();
    params.set('apps', selectedForCompare.join(','));
    navigate(`/studio/compare/${activeJobId}?${params.toString()}`);
  };

  const handleStageButtonClick = (newStage) => {
    if (!selectedCandidate || newStage === currentCandidateStage) return;
    setTargetStage(newStage);
    setShowTransitionPrompt(true);
  };

  const handleConfirmStageUpdate = async () => {
    if (!selectedCandidate || !targetStage) return;
    try {
      await updateStageMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        stage: targetStage,
        note: transitionNote.trim() || undefined,
        changed_by: 'Recruiter',
      });
      toast.success(`Candidate moved to ${targetStage}`);
      setShowTransitionPrompt(false);
      setTransitionNote('');
      setTargetStage('');
    } catch (err) {
      toast.error(err.message || 'Failed to update review stage');
    }
  };

  const handleQuickStageChange = async (candidate, newStage) => {
    if (!candidate || (candidate.review_stage || 'New') === newStage) return;
    try {
      await updateStageMutation.mutateAsync({
        applicationId: candidate.application_id,
        stage: newStage,
        changed_by: 'Recruiter',
      });
      toast.success(`${cleanCandidateName(candidate.candidate_name)} moved to ${newStage}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update review stage');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !newNoteContent.trim()) return;

    try {
      await addNoteMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        content: newNoteContent.trim(),
        author: 'Recruiter',
      });
      toast.success('Note added');
      setNewNoteContent('');
    } catch (err) {
      toast.error(err.message || 'Failed to add note');
    }
  };

  // Calculate total raw weight and normalized fractions
  const totalWeight = Math.max(
    0.01,
    (Number(weightValues.weight_skills) || 0) +
      (Number(weightValues.weight_text) || 0) +
      (Number(weightValues.weight_experience) || 0) +
      (Number(weightValues.weight_education) || 0)
  );

  const normalizedWeights = useMemo(
    () => ({
      weight_skills: Math.round(((Number(weightValues.weight_skills) || 0) / totalWeight) * 100) / 100,
      weight_text: Math.round(((Number(weightValues.weight_text) || 0) / totalWeight) * 100) / 100,
      weight_experience:
        Math.round(((Number(weightValues.weight_experience) || 0) / totalWeight) * 100) / 100,
      weight_education:
        Math.round(((Number(weightValues.weight_education) || 0) / totalWeight) * 100) / 100,
    }),
    [weightValues, totalWeight]
  );

  const handleApplyWeights = () => {
    setAppliedWeights(normalizedWeights);
    setIsWeightsOpen(false);
    toast.success('Custom weights applied to rankings');
  };

  const handleSaveJobWeights = async () => {
    try {
      await updateWeightsMutation.mutateAsync(normalizedWeights);
      setAppliedWeights(normalizedWeights);
      setIsWeightsOpen(false);
      toast.success('Scoring weights saved as job default');
    } catch (err) {
      toast.error(err.message || 'Failed to save job weights');
    }
  };

  const handleResetWeights = () => {
    setAppliedWeights(null);
    setWeightValues({
      weight_skills: 0.40,
      weight_text: 0.20,
      weight_experience: 0.25,
      weight_education: 0.15,
    });
    setIsWeightsOpen(false);
    toast.info('Reverted to balanced scoring defaults');
  };

  const renderDossierContent = (_isDrawer = false) => {
    if (!selectedCandidate || !selectedBreakdown) return null;

    return (
      <div className="space-y-5 animate-fadeIn">
        {/* 1. Executive Header */}
        <div className="space-y-3 pb-4 border-b border-line">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold">
                  Rank #{selectedCandidate.rank || safeSelectedIndex + 1}
                </span>
                <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink leading-tight">
                  {cleanCandidateName(selectedCandidate.candidate_name)}
                </h2>
              </div>

              <div className="flex items-center gap-2 mt-2 text-[13px] text-ink-muted flex-wrap">
                {selectedCandidate.experience_years !== undefined && (
                  <span className="inline-flex items-center gap-1 font-medium text-ink">
                    <Briefcase className="w-3.5 h-3.5 text-ink-subtle" />
                    <span>{selectedCandidate.experience_years} yrs exp</span>
                    {selectedCandidate.seniority_level && (
                      <span className="text-ink-muted">({selectedCandidate.seniority_level})</span>
                    )}
                  </span>
                )}
                {selectedCandidate.education_level &&
                  selectedCandidate.education_level !== 'Unspecified' && (
                    <>
                      <span className="text-ink-subtle">·</span>
                      <span className="inline-flex items-center gap-1 text-ink">
                        <GraduationCap className="w-3.5 h-3.5 text-ink-subtle" />
                        <span>{selectedCandidate.education_level}</span>
                      </span>
                    </>
                  )}
                {selectedCandidate.candidate_email && (
                  <>
                    <span className="text-ink-subtle">·</span>
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <Mail className="w-3.5 h-3.5 text-ink-subtle" />
                      <span>{selectedCandidate.candidate_email}</span>
                    </span>
                  </>
                )}
                {selectedCandidate.candidate_phone && (
                  <>
                    <span className="text-ink-subtle">·</span>
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                      <span>{selectedCandidate.candidate_phone}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Score Tile */}
            <div className="text-right shrink-0 p-3 rounded-[10px] bg-surface-alt/40 border border-line min-w-[110px]">
              <div className="text-[13px] font-medium text-ink-muted">Final score</div>
              <ScoreValue score={selectedBreakdown.finalScore} size="xl" />
            </div>
          </div>

          {/* Integrated Horizontal Pipeline Ribbon */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[13px] mb-1.5">
              <span className="font-semibold text-ink">Recruitment Stage</span>
              {currentCandidateStage === 'Rejected' ? (
                <button
                  type="button"
                  onClick={() => handleStageButtonClick('Reviewing')}
                  className="text-[13px] text-primary hover:underline font-medium cursor-pointer"
                >
                  Re-open Application
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStageButtonClick('Rejected')}
                  className="text-[13px] text-ink-muted hover:text-ink cursor-pointer px-2 py-0.5 rounded-[4px] border border-line hover:bg-surface-alt"
                >
                  Mark Rejected
                </button>
              )}
            </div>

            {/* Horizontal Segmented Ribbon */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-[8px] bg-surface-alt/70 border border-line">
              {['New', 'Reviewing', 'Interview', 'Hired'].map((s, idx) => {
                const isCurrent = currentCandidateStage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-label={`Advance to stage ${idx + 1}`}
                    onClick={() => handleStageButtonClick(s)}
                    disabled={updateStageMutation.isPending}
                    className={`py-1.5 px-2 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer text-center ${
                      isCurrent
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-ink-muted hover:text-ink hover:bg-surface'
                    }`}
                  >
                    <span aria-hidden="true">{s}</span>
                  </button>
                );
              })}
            </div>

            {/* Transition Note Prompt */}
            {showTransitionPrompt && (
              <div className="mt-2.5 p-3 rounded-[8px] border border-line bg-surface space-y-2 animate-fadeIn">
                <div className="text-[13px] font-medium text-ink flex items-center gap-1.5">
                  <span>Move candidate to:</span>
                  <span className="font-bold text-primary">{targetStage}</span>
                </div>
                <Input
                  placeholder="Optional transition reason or note..."
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowTransitionPrompt(false);
                      setTargetStage('');
                      setTransitionNote('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={updateStageMutation.isPending}
                    onClick={handleConfirmStageUpdate}
                  >
                    Confirm Move
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
        {/* Tab 1: Evaluation & Math */}
        <div className={dossierTab === 'scoring' ? 'space-y-4 animate-fadeIn' : 'hidden'}>
          <div className="space-y-1.5 p-3.5 rounded-[10px] bg-surface-alt/40 border border-line">
            <div className="text-[13px] font-medium text-ink flex items-center justify-between">
              <span>Multi-Pillar Score Progress</span>
              <span className="tabular-nums font-semibold text-[13px]">
                {selectedBreakdown.finalScore.toFixed(1)}%
              </span>
            </div>
            <ScoreBar
              skillsPoints={selectedBreakdown.skillsCoveredPoints}
              textMatchPoints={selectedBreakdown.textMatchPoints}
              experiencePoints={selectedBreakdown.experiencePoints}
              educationPoints={selectedBreakdown.educationPoints}
              finalScore={selectedBreakdown.finalScore}
              height="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[13px] tabular-nums">
            <div className="p-3 rounded-[8px] border border-line bg-surface space-y-0.5">
              <div className="text-ink-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Skills Coverage ({(selectedBreakdown.weightSkills * 100).toFixed(0)}%)</span>
              </div>
              <div className="text-[15px] font-semibold text-ink">
                {selectedBreakdown.skillsCoveredPoints.toFixed(1)} pts
              </div>
              <div className="text-[12px] text-ink-muted">
                {selectedBreakdown.skillsCoveredPercent.toFixed(1)}% match
              </div>
            </div>

            <div className="p-3 rounded-[8px] border border-line bg-surface space-y-0.5">
              <div className="text-ink-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>Semantic Text ({(selectedBreakdown.weightText * 100).toFixed(0)}%)</span>
              </div>
              <div className="text-[15px] font-semibold text-ink">
                {selectedBreakdown.textMatchPoints.toFixed(1)} pts
              </div>
              <div className="text-[12px] text-ink-muted">
                {selectedBreakdown.textMatchPercent.toFixed(1)}% match
              </div>
            </div>

            <div className="p-3 rounded-[8px] border border-line bg-surface space-y-0.5">
              <div className="text-ink-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink-muted" />
                <span>Experience Fit ({(selectedBreakdown.weightExperience * 100).toFixed(0)}%)</span>
              </div>
              <div className="text-[15px] font-semibold text-ink">
                {selectedBreakdown.experiencePoints.toFixed(1)} pts
              </div>
              <div className="text-[12px] text-ink-muted">
                {selectedBreakdown.experiencePercent.toFixed(1)}% score
              </div>
            </div>

            <div className="p-3 rounded-[8px] border border-line bg-surface space-y-0.5">
              <div className="text-ink-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-champagne/40 border border-champagne" />
                <span>Education ({(selectedBreakdown.weightEducation * 100).toFixed(0)}%)</span>
              </div>
              <div className="text-[15px] font-semibold text-ink">
                {selectedBreakdown.educationPoints.toFixed(1)} pts
              </div>
              <div className="text-[12px] text-ink-muted">
                {selectedBreakdown.educationPercent.toFixed(1)}% credential
              </div>
            </div>
          </div>

          {selectedCandidate.score_explanation && (
            <div className="p-3.5 rounded-[8px] border border-line bg-surface space-y-1">
              <div className="text-[13px] font-semibold text-ink">Explain score</div>
              <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">
                {selectedCandidate.score_explanation}
              </p>
            </div>
          )}
        </div>

        {/* Tab 2: Required Skills */}
        <div className={dossierTab === 'skills' ? 'space-y-3 animate-fadeIn' : 'hidden'}>
          <div className="flex items-center justify-between text-[13px] text-ink-muted pb-1 border-b border-line">
            <span>Skill Requirement</span>
            <span>Candidate Evidence</span>
          </div>
          <div className="space-y-1.5">
            {activeJob?.required_skills?.map((skill, sIdx) => {
              const isFound = selectedCandidate.matched_skills?.some(
                (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
              );
              const equivSource = selectedCandidate.equivalent_skills?.[skill];

              return (
                <div
                  key={sIdx}
                  className="flex items-center justify-between text-[13px] py-1.5 px-2.5 rounded-[6px] hover:bg-surface-alt/50 border border-line/60 transition-colors gap-2"
                >
                  <span className="font-medium text-ink">{skill}</span>
                  {isFound ? (
                    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink bg-champagne-soft px-2 py-0.5 rounded-[4px]">
                      <Check className="w-3.5 h-3.5 text-champagne" />
                      Found in resume
                    </span>
                  ) : equivSource ? (
                    <span
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-ink bg-champagne-soft/70 px-2 py-0.5 rounded-[4px] border border-champagne/30"
                      title="Recognized as equivalent skill family with 75% credit"
                    >
                      <Check className="w-3.5 h-3.5 text-champagne" />
                      Via {equivSource} (75%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[13px] text-ink-muted bg-surface-alt px-2 py-0.5 rounded-[4px] border border-dashed border-line">
                      <Minus className="w-3.5 h-3.5 text-ink-subtle" />
                      Missing
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab 3: Notes & Activity */}
        <div className={dossierTab === 'notes' ? 'space-y-4 animate-fadeIn' : 'hidden'}>
          <form onSubmit={handleAddNote} className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add recruiter feedback or review note..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newNoteContent.trim() || addNoteMutation.isPending}
                loading={addNoteMutation.isPending}
              >
                Post
              </Button>
            </div>
          </form>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {notesList.length === 0 ? (
              <p className="text-[13px] text-ink-muted italic py-1">No notes recorded yet.</p>
            ) : (
              notesList.map((n, i) => (
                <div
                  key={n.note_id || i}
                  className="p-3 rounded-[8px] bg-surface border border-line text-[13px] space-y-1"
                >
                  <div className="flex items-center justify-between text-[13px] text-ink-muted">
                    <span className="font-semibold text-ink">{n.author}</span>
                    <span className="tabular-nums">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-ink leading-relaxed text-[13px]">{n.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setShowAuditTrail(!showAuditTrail)}
              className="flex items-center justify-between w-full text-[13px] font-semibold text-ink hover:text-primary transition-colors cursor-pointer py-1"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-ink-muted" />
                <span>Status history ({statusHistoryList.length})</span>
              </div>
              <span className="text-[13px] text-ink-muted font-normal">
                {showAuditTrail ? 'Hide' : 'Show'}
              </span>
            </button>

            {showAuditTrail && (
              <div className="space-y-2 pt-2 border-l-2 border-line ml-2 pl-3">
                {statusHistoryList.length === 0 ? (
                  <p className="text-[13px] text-ink-muted italic">No transitions recorded.</p>
                ) : (
                  statusHistoryList.map((h, i) => (
                    <div key={h.history_id || i} className="text-[13px] space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">
                          {h.from_stage ? `${h.from_stage} → ${h.to_stage}` : `Initial: ${h.to_stage}`}
                        </span>
                        <span className="text-ink-muted tabular-nums">
                          {new Date(h.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-ink-muted">
                        by {h.changed_by}
                        {h.note && <span className="italic text-ink"> — "{h.note}"</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Compare Footer */}
        <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
          <Button
            variant={
              selectedForCompare.includes(selectedCandidate.application_id)
                ? 'secondary'
                : 'primary'
            }
            size="sm"
            leftIcon={<GitCompare className="w-3.5 h-3.5" />}
            onClick={() => handleToggleCompare(selectedCandidate.application_id)}
          >
            {selectedForCompare.includes(selectedCandidate.application_id)
              ? 'Remove from compare'
              : 'Add to compare'}
          </Button>

          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface-alt border border-line text-[11px] font-mono">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface-alt border border-line text-[11px] font-mono">
              ↓
            </kbd>
            <span>to browse</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Job Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
            Leaderboard
          </h1>
          <p className="text-[14px] text-ink-muted mt-1">
            Explainable candidate rankings with multi-pillar scoring, configurable weights, and pipeline review.
          </p>
        </div>

        {/* Job Selector + Weights Tuner + Export */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {jobs.length > 0 && (
            <div className="w-56">
              <Select value={activeJobId} onChange={(e) => handleJobChange(e.target.value)}>
                {jobs.map((job) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Scoring Weights Tuner Trigger */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            onClick={() => setIsWeightsOpen(true)}
            className="relative"
          >
            <span>Weights</span>
            {(appliedWeights || activeJob?.custom_weights) && (
              <span className="w-1.5 h-1.5 rounded-full bg-champagne ml-0.5" title="Custom weights active" />
            )}
          </Button>

          {activeJobId && (
            <a
              href={getExportCsvUrl(activeJobId)}
              download
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] border border-line bg-surface hover:bg-surface-alt text-[13px] font-medium text-ink transition-colors cursor-pointer select-none"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-ink-muted" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Unified Action & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-[12px] bg-surface border border-line">
        {/* Left: Search input */}
        <div className="w-full lg:w-72">
          <Input
            placeholder="Search candidates or skills..."
            leftIcon={<Search className="w-4 h-4 text-ink-muted" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Center: Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[13px] text-ink-muted font-medium mr-1 shrink-0">Stage:</span>
          {['All', ...STAGES].map((stg) => {
            const isSelected = stageFilter === stg;
            const count =
              stg === 'All'
                ? rawCandidates.length
                : rawCandidates.filter((c) => (c.review_stage || 'New') === stg).length;
            return (
              <button
                key={stg}
                type="button"
                onClick={() => setStageFilter(stg)}
                className={`px-3 py-1.5 rounded-[8px] text-[13px] border transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary font-medium'
                    : 'bg-surface border-line text-ink-muted hover:text-ink hover:bg-surface-alt'
                }`}
              >
                <span>{stg}</span>
                <span className="ml-1.5 tabular-nums text-[13px] opacity-75">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Sort controls & Layout switcher */}
        <div className="flex items-center gap-2 text-[13px] text-ink-muted shrink-0 flex-wrap">
          <span className="hidden xl:inline">Sort:</span>
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'score') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('score');
                setSortOrder('desc');
              }
            }}
            className={`px-3 py-1.5 rounded-[8px] border border-line cursor-pointer text-[13px] ${
              sortBy === 'score' ? 'bg-surface-alt text-ink font-semibold' : 'bg-surface'
            }`}
          >
            Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'name') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('name');
                setSortOrder('asc');
              }
            }}
            className={`px-3 py-1.5 rounded-[8px] border border-line cursor-pointer text-[13px] ${
              sortBy === 'name' ? 'bg-surface-alt text-ink font-semibold' : 'bg-surface'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>

          {/* Layout mode switcher */}
          <div className="hidden md:flex items-center p-0.5 rounded-[8px] border border-line bg-surface ml-1">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Split View (Side-by-side table & dossier)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Full Table with Slide-Over Dossier"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Full table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      {jobsLoading || rankingsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="hidden lg:block lg:col-span-5">
            <Skeleton className="h-96 w-full rounded-[14px]" />
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          title={
            search || stageFilter !== 'All'
              ? 'No candidates match your filter'
              : 'No candidates evaluated'
          }
          description={
            search || stageFilter !== 'All'
              ? 'Try modifying your search keywords or selecting another stage.'
              : 'Upload resumes for this job opening to populate the leaderboard.'
          }
          action={
            !search &&
            stageFilter === 'All' && (
              <Button onClick={() => navigate('/studio/upload')}>Upload resumes</Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Candidate Table */}
          <div
            ref={tableContainerRef}
            className={`${
              viewMode === 'table' ? 'lg:col-span-12' : 'lg:col-span-7'
            } rounded-[14px] border border-line bg-surface overflow-hidden focus:outline-none transition-all duration-200`}
            tabIndex={0}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] text-ink border-collapse">
                <thead className="border-b border-line bg-surface-alt/40 text-[13px] font-medium text-ink-muted">
                  <tr>
                    <th className="w-10 px-3 py-3 text-center">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="w-14 px-3 py-3 text-center font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="w-32 px-3 py-3 font-medium">Stage</th>
                    <th className="w-20 px-3 py-3 text-right font-medium hidden sm:table-cell">
                      Skills
                    </th>
                    <th className="w-20 px-3 py-3 text-right font-medium hidden sm:table-cell">
                      Text
                    </th>
                    <th className="w-28 px-4 py-3 text-right font-medium">Final Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {candidates.map((candidate, idx) => {
                    const isSelected = safeSelectedIndex === idx;
                    const isCompared = selectedForCompare.includes(candidate.application_id);
                    const breakdown = computeBreakdown(candidate, activeJob);
                    const stageKey = candidate.review_stage || 'New';
                    const stageConf = STAGE_CONFIG[stageKey] || STAGE_CONFIG.New;

                    return (
                      <tr
                        key={candidate.application_id || idx}
                        onClick={() => {
                          setSelectedIndex(idx);
                          setShowTransitionPrompt(false);
                          if (viewMode === 'table' || window.innerWidth < 1024) {
                            setIsDrawerOpen(true);
                          }
                        }}
                        className={`transition-colors cursor-pointer select-none ${
                          isSelected ? 'bg-surface-alt font-medium' : 'hover:bg-surface-alt/50'
                        }`}
                      >
                        {/* Checkbox for compare */}
                        <td
                          className="px-3 py-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompare(candidate.application_id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={() => {}}
                            className="rounded-[4px] border-line accent-primary cursor-pointer"
                          />
                        </td>

                        {/* Rank */}
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-[6px] text-[13px] font-semibold ${
                              idx === 0 ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink'
                            }`}
                          >
                            {candidate.rank || idx + 1}
                          </span>
                        </td>

                        {/* Candidate Name, Email, Experience & Equiv Skills */}
                        <td className="px-4 py-3 min-w-[170px]">
                          <div className="font-semibold text-ink text-[14px]">
                            {cleanCandidateName(candidate.candidate_name)}
                          </div>
                          <div className="text-[13px] text-ink-muted truncate">
                            {candidate.candidate_email || '—'}
                          </div>
                          {(candidate.experience_years !== undefined ||
                            candidate.education_level) && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[13px] text-ink-muted flex-wrap">
                              {candidate.experience_years !== undefined && (
                                <span className="font-medium text-ink">
                                  {candidate.experience_years} yrs
                                </span>
                              )}
                              {candidate.seniority_level && (
                                <>
                                  <span className="text-ink-subtle">·</span>
                                  <span>{candidate.seniority_level}</span>
                                </>
                              )}
                              {candidate.education_level &&
                                candidate.education_level !== 'Unspecified' && (
                                  <>
                                    <span className="text-ink-subtle">·</span>
                                    <span className="truncate max-w-[120px]">
                                      {candidate.education_level}
                                    </span>
                                  </>
                                )}
                            </div>
                          )}
                          {candidate.equivalent_skills &&
                            Object.keys(candidate.equivalent_skills).length > 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[13px] bg-champagne-soft text-ink font-medium border border-champagne/30">
                                  <span>
                                    +{Object.keys(candidate.equivalent_skills).length} equiv skill
                                  </span>
                                </span>
                              </div>
                            )}
                        </td>

                        {/* Interactive Stage Badge Dropdown */}
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              aria-label={`Change stage for candidate ${idx + 1}`}
                              onClick={() =>
                                setOpenStageMenuId(
                                  openStageMenuId === candidate.application_id
                                    ? null
                                    : candidate.application_id
                                )
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer border ${
                                stageConf.badge
                              }`}
                              title="Click to transition applicant pipeline stage"
                            >
                              <span aria-hidden="true">{stageKey}</span>
                              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                            </button>

                            {openStageMenuId === candidate.application_id && (
                              <div className="absolute left-0 mt-1 w-36 rounded-[8px] bg-surface border border-line shadow-xl z-30 py-1 animate-fadeIn">
                                {STAGES.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      handleQuickStageChange(candidate, s);
                                      setOpenStageMenuId(null);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface-alt transition-colors flex items-center justify-between cursor-pointer ${
                                      stageKey === s
                                        ? 'font-semibold text-primary bg-surface-alt/60'
                                        : 'text-ink'
                                    }`}
                                  >
                                    <span>{s}</span>
                                    {stageKey === s && <Check className="w-3 h-3 text-primary" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Skills Covered % */}
                        <td className="px-3 py-3 text-right tabular-nums text-ink-muted text-[13px] hidden sm:table-cell">
                          {breakdown.skillsCoveredPercent.toFixed(1)}%
                        </td>

                        {/* Text Match % */}
                        <td className="px-3 py-3 text-right tabular-nums text-ink-muted text-[13px] hidden sm:table-cell">
                          {breakdown.textMatchPercent.toFixed(1)}%
                        </td>

                        {/* Final Score with Slim Bar */}
                        <td className="px-4 py-3 text-right">
                          <div className="space-y-1">
                            <ScoreValue score={breakdown.finalScore} size="sm" />
                            <ScoreBar
                              skillsPoints={breakdown.skillsCoveredPoints}
                              textMatchPoints={breakdown.textMatchPoints}
                              experiencePoints={breakdown.experiencePoints}
                              educationPoints={breakdown.educationPoints}
                              finalScore={breakdown.finalScore}
                              height="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Master-Detail Candidate & Review Panel (shown in split view) */}
          {viewMode === 'split' && (
            <div className="hidden lg:block lg:col-span-5 sticky top-20" aria-live="polite">
              {selectedCandidate && selectedBreakdown ? (
                <Panel className="p-5 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4">
                  {renderDossierContent(false)}
                </Panel>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Candidate Dossier Slide-Over Drawer (for full-table mode and mobile) */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedCandidate
            ? `${cleanCandidateName(selectedCandidate.candidate_name)}`
            : 'Candidate Dossier'
        }
        maxWidth="max-w-2xl"
      >
        {selectedCandidate && selectedBreakdown && renderDossierContent(true)}
      </Drawer>

      {/* Floating Multi-Select Action Bar (shown when 2+ candidates are checked) */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-on-primary px-5 py-3 rounded-[12px] shadow-2xl flex items-center gap-4 border border-line animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="text-[13px] font-medium">
            {selectedForCompare.length} candidates selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInitiateCompare}
              className="px-3 py-1.5 rounded-[8px] bg-champagne text-ink text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Compare
            </button>
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="px-2 py-1.5 text-[13px] text-on-primary/80 hover:text-on-primary cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Mobile Detail Modal Fallback */}
      {mobileDetailOpen && selectedCandidate && selectedBreakdown && (
        <Dialog
          isOpen={mobileDetailOpen}
          onClose={() => setMobileDetailOpen(false)}
          title={cleanCandidateName(selectedCandidate.candidate_name)}
          description={selectedCandidate.candidate_email}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-surface-alt space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-muted">Final score</span>
                <ScoreValue score={selectedBreakdown.finalScore} size="lg" />
              </div>
              <ScoreBar
                skillsPoints={selectedBreakdown.skillsCoveredPoints}
                textMatchPoints={selectedBreakdown.textMatchPoints}
                experiencePoints={selectedBreakdown.experiencePoints}
                educationPoints={selectedBreakdown.educationPoints}
                finalScore={selectedBreakdown.finalScore}
                height="h-2"
              />
            </div>

            {/* Mobile Stage Selector */}
            <div className="p-3 rounded-[10px] bg-surface-alt/50 border border-line space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink">Review stage</span>
                <span
                  className={`px-2 py-0.5 rounded-[6px] text-[13px] ${
                    (STAGE_CONFIG[currentCandidateStage] || STAGE_CONFIG.New).badge
                  }`}
                >
                  {currentCandidateStage}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {STAGES.map((s) => (
                  <Button
                    key={s}
                    variant={currentCandidateStage === s ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      handleStageButtonClick(s);
                      setMobileDetailOpen(false);
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setMobileDetailOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleToggleCompare(selectedCandidate.application_id);
                  setMobileDetailOpen(false);
                }}
              >
                {selectedForCompare.includes(selectedCandidate.application_id)
                  ? 'Remove from compare'
                  : 'Add to compare'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Scoring Weights Tuner Dialog */}
      {isWeightsOpen && (
        <Dialog
          isOpen={isWeightsOpen}
          onClose={() => setIsWeightsOpen(false)}
          title="Recruiter Scoring Weights & Tuner"
          description="Adjust multi-pillar scoring weights dynamically. Re-ranks candidates instantly using transparent, auditable math."
        >
          <div className="space-y-6 pt-2">
            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-ink">Weight Presets</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setWeightValues({
                      weight_skills: 0.40,
                      weight_text: 0.20,
                      weight_experience: 0.25,
                      weight_education: 0.15,
                    })
                  }
                  className="p-2.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-left text-[13px] transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-ink">Balanced</div>
                  <div className="text-ink-muted text-[13px] tabular-nums mt-0.5">
                    40 / 20 / 25 / 15
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWeightValues({
                      weight_skills: 0.60,
                      weight_text: 0.15,
                      weight_experience: 0.15,
                      weight_education: 0.10,
                    })
                  }
                  className="p-2.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-left text-[13px] transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-ink">Skills-First</div>
                  <div className="text-ink-muted text-[13px] tabular-nums mt-0.5">
                    60 / 15 / 15 / 10
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWeightValues({
                      weight_skills: 0.25,
                      weight_text: 0.15,
                      weight_experience: 0.45,
                      weight_education: 0.15,
                    })
                  }
                  className="p-2.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-left text-[13px] transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-ink">Seniority-First</div>
                  <div className="text-ink-muted text-[13px] tabular-nums mt-0.5">
                    25 / 15 / 45 / 15
                  </div>
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 p-4 rounded-[12px] bg-surface-alt/50 border border-line">
              {/* 1. Skills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Required Skills Coverage
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {(normalizedWeights.weight_skills * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={weightValues.weight_skills}
                  onChange={(e) =>
                    setWeightValues((prev) => ({
                      ...prev,
                      weight_skills: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* 2. Text Match */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-champagne" />
                    Text Semantic Similarity
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {(normalizedWeights.weight_text * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={weightValues.weight_text}
                  onChange={(e) =>
                    setWeightValues((prev) => ({
                      ...prev,
                      weight_text: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* 3. Experience */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-muted" />
                    Experience & Seniority Fit
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {(normalizedWeights.weight_experience * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={weightValues.weight_experience}
                  onChange={(e) =>
                    setWeightValues((prev) => ({
                      ...prev,
                      weight_experience: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* 4. Education */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-champagne/40 border border-champagne" />
                    Education Level
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {(normalizedWeights.weight_education * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={weightValues.weight_education}
                  onChange={(e) =>
                    setWeightValues((prev) => ({
                      ...prev,
                      weight_education: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleResetWeights}
              >
                Reset defaults
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={updateWeightsMutation.isPending}
                  onClick={handleSaveJobWeights}
                >
                  Save as job default
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyWeights}>
                  Apply to rankings
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
