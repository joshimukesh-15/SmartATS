import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs, useRankings } from '../../hooks';
import { Button, EmptyState, Skeleton, StatusBadge } from '../../components/ui';
import { sortCandidates } from '../../lib/score';

import { useCandidateSelection, useStageWorkflow, STAGES } from '../candidates';

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

  const [openStageMenuId, setOpenStageMenuId] = useState(null);

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
    selectedForCompare,
    handleToggleCompare,
    handleInitiateCompare,
    clearCompare,
  } = useCandidateSelection(candidates, { activeJobId, defaultToFirst: false });

  // Workflow hook for stage mutations and notes from candidates feature
  const stageWorkflow = useStageWorkflow(activeJobId, null);
  const { handleQuickStageChange } = stageWorkflow;

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
  };

  const openCandidateWorkspace = (index) => {
    const candidate = candidates[index];
    const candidateId = candidate?.application_id ?? candidate?.id ?? candidate?.candidate_id;
    if (!candidateId) return;
    navigate(`/studio/candidates?jobId=${encodeURIComponent(activeJobId)}&candidate=${encodeURIComponent(candidateId)}`);
  };

  return (
    <div className="flex min-h-0 flex-col gap-3 xl:h-full xl:gap-3 animate-fadeIn">
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
          className="flex shrink-0 items-center gap-3 px-4 py-2 rounded-[10px] bg-champagne-soft border border-champagne/40 text-ink text-[13px] animate-fadeIn"
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
      />

      {/* Master-Detail Layout */}
      {jobsLoading || rankingsLoading ? (
        <div className="space-y-3 xl:flex-1 xl:min-h-0">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="xl:flex xl:flex-1 xl:min-h-0 xl:items-center xl:justify-center">
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
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <LeaderboardTable
              candidates={candidates}
              selectedForCompare={selectedForCompare}
              activeJob={activeJob}
              onSelectCandidate={openCandidateWorkspace}
              onToggleCompare={handleToggleCompare}
              openStageMenuId={openStageMenuId}
              setOpenStageMenuId={setOpenStageMenuId}
              onQuickStageChange={handleQuickStageChange}
              tableContainerRef={tableContainerRef}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
              }}
            />
          </div>

        </div>
      )}

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
