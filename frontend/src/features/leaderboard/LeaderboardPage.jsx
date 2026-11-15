import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs, useRankings } from '../../hooks';
import { Button, EmptyState, Skeleton, Drawer } from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';
import { computeBreakdown, sortCandidates } from '../../lib/score';

import { STAGES } from './constants';
import { useLeaderboardSelection } from './hooks/useLeaderboardSelection';
import { useLeaderboardKeyboard } from './hooks/useLeaderboardKeyboard';
import { useScoringWeights } from './hooks/useScoringWeights';
import { useApplicationWorkflow } from './hooks/useApplicationWorkflow';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardFilters from './LeaderboardFilters';
import LeaderboardTable from './LeaderboardTable';
import CandidateDetailPanel from './CandidateDetailPanel';
import SelectionBar from './SelectionBar';
import WeightsTunerDialog from './WeightsTunerDialog';

export default function LeaderboardPage() {
  const { jobId: routeJobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  // Active Job ID
  const activeJobId = routeJobId || (jobs.length > 0 ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((j) => String(j.job_id) === String(activeJobId));

  // Scoring Weights Hook
  const {
    isWeightsOpen,
    setIsWeightsOpen,
    appliedWeights,
    weightValues,
    setWeightValues,
    normalizedWeights,
    handleApplyWeights,
    handleSaveJobWeights,
    handleResetWeights,
    isSavingWeights,
  } = useScoringWeights(activeJob, activeJobId);

  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(activeJobId, appliedWeights);

  // Search & Stage Filter state
  const [search, setSearch] = useState('');
  const initialStage = searchParams.get('stage');
  const [stageFilter, setStageFilter] = useState(
    initialStage && STAGES.includes(initialStage) ? initialStage : 'All'
  );
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Row density state with localStorage persistence
  const [density, setDensity] = useState(() => {
    try {
      return localStorage.getItem('smartats_leaderboard_density') || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    try {
      localStorage.setItem('smartats_leaderboard_density', newDensity);
    } catch {}
  };

  // Dossier UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState('scoring');
  const [openStageMenuId, setOpenStageMenuId] = useState(null);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

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

  // Selection & keyboard hooks
  const {
    setSelectedIndex,
    safeSelectedIndex,
    selectedForCompare,
    handleToggleCompare,
    handleInitiateCompare,
    clearCompare,
  } = useLeaderboardSelection({ candidatesCount: candidates.length, activeJobId });

  useLeaderboardKeyboard({ candidatesCount: candidates.length, setSelectedIndex });

  const selectedCandidate = candidates[safeSelectedIndex] || null;
  const selectedBreakdown = selectedCandidate
    ? computeBreakdown(selectedCandidate, activeJob)
    : null;

  // Workflow hook for stage mutations and notes
  const {
    newNoteContent,
    setNewNoteContent,
    showTransitionPrompt,
    setShowTransitionPrompt,
    targetStage,
    setTargetStage,
    transitionNote,
    setTransitionNote,
    handleStageButtonClick,
    handleConfirmStageUpdate,
    handleQuickStageChange,
    handleAddNote,
    isUpdatingStage,
    isAddingNote,
  } = useApplicationWorkflow(activeJobId, selectedCandidate);

  const handleJobChange = (newJobId) => {
    navigate(`/studio/leaderboard/${newJobId}`);
    clearCompare();
    setSelectedIndex(0);
    setShowTransitionPrompt(false);
  };

  const renderDetailPanel = () => (
    <CandidateDetailPanel
      candidate={selectedCandidate}
      breakdown={selectedBreakdown}
      activeJob={activeJob}
      safeSelectedIndex={safeSelectedIndex}
      selectedForCompare={selectedForCompare}
      onToggleCompare={handleToggleCompare}
      onStageButtonClick={handleStageButtonClick}
      onConfirmStageUpdate={handleConfirmStageUpdate}
      showTransitionPrompt={showTransitionPrompt}
      setShowTransitionPrompt={setShowTransitionPrompt}
      targetStage={targetStage}
      setTargetStage={setTargetStage}
      transitionNote={transitionNote}
      setTransitionNote={setTransitionNote}
      isUpdatingStage={isUpdatingStage}
      onAddNote={handleAddNote}
      newNoteContent={newNoteContent}
      setNewNoteContent={setNewNoteContent}
      isAddingNote={isAddingNote}
      dossierTab={dossierTab}
      setDossierTab={setDossierTab}
      showAuditTrail={showAuditTrail}
      setShowAuditTrail={setShowAuditTrail}
    />
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Job Switcher */}
      <LeaderboardHeader
        jobs={jobs}
        activeJobId={activeJobId}
        activeJob={activeJob}
        onJobChange={handleJobChange}
        appliedWeights={appliedWeights}
        onOpenWeights={() => setIsWeightsOpen(true)}
      />

      {/* Unified Action & Filter Toolbar */}
      <LeaderboardFilters
        search={search}
        setSearch={setSearch}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        rawCandidates={rawCandidates}
        activeJobId={activeJobId}
        selectedCandidate={selectedCandidate}
        density={density}
        onDensityChange={handleDensityChange}
      />

      {/* Master-Detail Layout */}
      {jobsLoading || rankingsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
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
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            <LeaderboardTable
              candidates={candidates}
              safeSelectedIndex={safeSelectedIndex}
              selectedForCompare={selectedForCompare}
              activeJob={activeJob}
              onSelectCandidate={(idx) => {
                setSelectedIndex(idx);
                setShowTransitionPrompt(false);
                setIsDrawerOpen(true);
              }}
              onToggleCompare={handleToggleCompare}
              openStageMenuId={openStageMenuId}
              setOpenStageMenuId={setOpenStageMenuId}
              onQuickStageChange={handleQuickStageChange}
              tableContainerRef={tableContainerRef}
              density={density}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
              }}
            />
          </div>

          {/* Desktop Sticky Candidate Detail Panel */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
            {selectedCandidate && selectedBreakdown && renderDetailPanel()}
          </div>
        </div>
      )}

      {/* Candidate Dossier Slide-Over Drawer for Mobile / Compact Screens */}
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
        {selectedCandidate && selectedBreakdown && renderDetailPanel()}
      </Drawer>

      {/* Floating Multi-Select Action Bar */}
      <SelectionBar
        selectedCount={selectedForCompare.length}
        onCompare={handleInitiateCompare}
        onClear={clearCompare}
      />

      {/* Scoring Weights Tuner Dialog */}
      <WeightsTunerDialog
        isOpen={isWeightsOpen}
        onClose={() => setIsWeightsOpen(false)}
        weightValues={weightValues}
        setWeightValues={setWeightValues}
        normalizedWeights={normalizedWeights}
        onResetWeights={handleResetWeights}
        onSaveJobWeights={handleSaveJobWeights}
        onApplyWeights={handleApplyWeights}
        isSavingWeights={isSavingWeights}
      />
    </div>
  );
}
