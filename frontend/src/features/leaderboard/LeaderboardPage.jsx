import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs, useRankings } from '../../hooks';
import { Button, EmptyState, Skeleton, Drawer, StatusBadge } from '../../components/ui';
import { computeBreakdown, sortCandidates } from '../../lib/score';

import {
  CandidateDetail,
  useCandidateSelection,
  useCandidateKeyboard,
  useStageWorkflow,
  STAGES,
} from '../candidates';

import { useScoringWeights } from './hooks/useScoringWeights';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardFilters from './LeaderboardFilters';
import LeaderboardTable from './LeaderboardTable';
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
    initialStage && (STAGES.includes(initialStage) || initialStage === 'Interview') ? initialStage : 'All'
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
  const [dossierTab, setDossierTab] = useState('evaluation');
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
      list = list.filter((c) => {
        const stage = c.review_stage || 'New';
        if (stage === stageFilter) return true;
        if (stageFilter === 'Interviewing' && stage === 'Interview') return true;
        if (stageFilter === 'Interview' && stage === 'Interviewing') return true;
        return false;
      });
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

  // Selection & keyboard hooks from candidates feature
  const {
    safeSelectedIndex,
    selectedCandidate,
    setSelectedIndex,
    selectedForCompare,
    handleToggleCompare,
    handleInitiateCompare,
    clearCompare,
  } = useCandidateSelection(candidates, { activeJobId });

  useCandidateKeyboard({
    candidatesCount: candidates.length,
    setSelectedIndex,
    onEscape: () => setIsDrawerOpen(false),
  });

  const selectedBreakdown = selectedCandidate
    ? computeBreakdown(selectedCandidate, activeJob)
    : null;

  // Workflow hook for stage mutations and notes from candidates feature
  const stageWorkflow = useStageWorkflow(activeJobId, selectedCandidate);
  const { handleQuickStageChange, setShowTransitionPrompt } = stageWorkflow;

  // Re-scoring detection across active job, rankings response, and candidates
  const isJobReScoring = useMemo(() => {
    return Boolean(
      activeJob?.processing_status === 'Re-scoring' ||
      activeJob?.processing_status === 'PROCESSING' ||
      activeJob?.status === 'Re-scoring' ||
      activeJob?.status === 'PROCESSING' ||
      rankingsData?.processing_status === 'Re-scoring' ||
      rankingsData?.processing_status === 'PROCESSING' ||
      rawCandidates.some(
        (c) =>
          c.processing_status === 'Re-scoring' ||
          c.processing_status?.toUpperCase() === 'RE-SCORING' ||
          c.processing_status?.toUpperCase() === 'PROCESSING'
      )
    );
  }, [activeJob, rankingsData, rawCandidates]);

  const handleJobChange = (newJobId) => {
    navigate(`/studio/leaderboard/${newJobId}`);
    clearCompare();
    setSelectedIndex(0);
    setShowTransitionPrompt(false);
  };

  const renderDetailPanel = () => (
    <CandidateDetail
      candidate={selectedCandidate}
      breakdown={selectedBreakdown}
      activeJob={activeJob}
      safeSelectedIndex={safeSelectedIndex}
      selectedForCompare={selectedForCompare}
      onToggleCompare={handleToggleCompare}
      stageWorkflow={stageWorkflow}
      onOpenWeightsTuner={() => setIsWeightsOpen(true)}
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
        isJobReScoring={isJobReScoring}
      />

      {/* Re-scoring in progress visual indicator */}
      {isJobReScoring && (
        <div
          data-testid="rescoring-banner"
          className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-champagne-soft border border-champagne/40 text-ink text-[14px] animate-fadeIn"
        >
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-champagne animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-ink">Re-scoring in progress</span>
            <span className="text-ink-muted ml-2">
              Corpus vectorizers and candidate scores are being recalculated in the background.
            </span>
          </div>
          <StatusBadge status="Re-scoring" />
        </div>
      )}

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
            ? `${selectedCandidate.candidate_name || 'Candidate'}`
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
