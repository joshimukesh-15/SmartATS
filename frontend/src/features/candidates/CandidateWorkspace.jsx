import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, List, Table as TableIcon, Kanban, GitCompare, X } from 'lucide-react';
import { Button, EmptyState, Input, Select, Skeleton } from '../../components/ui';
import { useJobs, useRankings } from '../../hooks';
import { computeBreakdown, sortCandidates } from '../../lib/score';
import { STAGES, normalizeStage, useCandidateSelection, useStageWorkflow } from './index';
import ListView from './views/ListView';
import TableView from './views/TableView';
import BoardView from './views/BoardView';
import CompareModal from './views/CompareModal';

const FILTER_STAGES = ['All', ...STAGES.filter((s) => s !== 'Rejected'), 'Rejected'];

export default function CandidateWorkspace({ initialView, initialCompare }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL State Management
  const viewParam = searchParams.get('view') || initialView || 'list';
  const activeView = ['list', 'table', 'board'].includes(viewParam) ? viewParam : 'list';

  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const activeJobId = searchParams.get('job') || searchParams.get('jobId') || (jobs[0] ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((job) => String(job.job_id) === String(activeJobId));

  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(activeJobId);
  const rawCandidates = useMemo(() => rankingsData?.rankings || [], [rankingsData?.rankings]);

  // URL filters: search, stage, minScore, sort, order
  const searchQuery = searchParams.get('search') || '';
  const stageFilter = searchParams.get('stage') || 'All';
  const minScoreFilter = Number(searchParams.get('minScore') || 0);
  const sortBy = searchParams.get('sort') || 'score';
  const sortOrder = searchParams.get('order') || 'desc';

  const updateParams = (updates, replace = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') next.delete(key);
        else next.set(key, String(val));
      });
      return next;
    }, { replace });
  };

  // Filtered & Sorted Candidate List (shared across all views)
  const candidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = rawCandidates.filter((cand) => {
      const stage = normalizeStage(cand.review_stage);
      const stageMatches = stageFilter === 'All' || stage === stageFilter;
      const searchMatches = !q || [cand.candidate_name, cand.candidate_email, ...(cand.matched_skills || [])].some((val) => String(val || '').toLowerCase().includes(q));
      return stageMatches && searchMatches && (cand.final_score ?? 0) >= minScoreFilter;
    });
    return sortCandidates(list, sortBy, sortOrder);
  }, [rawCandidates, searchQuery, stageFilter, minScoreFilter, sortBy, sortOrder]);

  const selection = useCandidateSelection(candidates, { activeJobId, defaultToFirst: activeView === 'list' });
  const workflow = useStageWorkflow(activeJobId, selection.selectedCandidate);
  const [isCompareOpen, setIsCompareOpen] = useState(Boolean(initialCompare || searchParams.get('compare') === 'true'));

  const isJobReScoring = useMemo(() => Boolean(
    activeJob?.processing_status === 'Re-scoring' || activeJob?.processing_status === 'PROCESSING' ||
    rankingsData?.processing_status === 'Re-scoring' || rawCandidates.some((c) => c.processing_status === 'Re-scoring' || c.processing_status?.toUpperCase() === 'RE-SCORING')
  ), [activeJob, rankingsData, rawCandidates]);

  const stageCounts = useMemo(() => Object.fromEntries(
    FILTER_STAGES.map((s) => [s, s === 'All' ? rawCandidates.length : rawCandidates.filter((c) => normalizeStage(c.review_stage) === s).length])
  ), [rawCandidates]);

  const viewModes = [
    { id: 'list', label: 'List', icon: List },
    { id: 'table', label: 'Table', icon: TableIcon },
    { id: 'board', label: 'Board', icon: Kanban },
  ];

  const handleViewKeyDown = (e, currentIdx) => {
    let nextIdx = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = (currentIdx + 1) % viewModes.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = (currentIdx - 1 + viewModes.length) % viewModes.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = viewModes.length - 1;
    }
    if (nextIdx !== null) {
      e.preventDefault();
      const nextId = viewModes[nextIdx].id;
      updateParams({ view: nextId });
      const tabElements = e.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
      tabElements?.[nextIdx]?.focus();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-7 pb-36 sm:pb-40 sm:px-8">
      {/* Top Header & Navigation Segmented Control */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink">Candidates</h1>
          <p className="mt-1 text-[15px] text-ink-muted">Review profiles, compare evidence, and move candidates through your hiring process.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-[10px] border border-line bg-surface p-1 shadow-xs" role="tablist" aria-label="View mode">
            {viewModes.map(({ id, label, icon: Icon }, idx) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeView === id}
                tabIndex={activeView === id ? 0 : -1}
                onKeyDown={(e) => handleViewKeyDown(e, idx)}
                onClick={() => updateParams({ view: id })}
                className={`flex cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  activeView === id ? 'bg-primary text-on-primary shadow-xs' : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="w-56 max-w-full">
            <Select aria-label="Choose a job" value={activeJobId} onChange={(e) => updateParams({ job: e.target.value, jobId: e.target.value, candidate: null })}>
              {!jobs.length && <option value="">No job selected</option>}
              {jobs.map((job) => <option key={job.job_id} value={job.job_id}>{job.title}</option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* Shared Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] max-w-[420px] flex-1">
          <Input placeholder="Search by name, email, or skill" leftIcon={<Search className="h-4 w-4 text-ink-muted" />} value={searchQuery} onChange={(e) => updateParams({ search: e.target.value })} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Filter candidates by stage">
          {FILTER_STAGES.map((st) => (
            <button key={st} type="button" aria-pressed={stageFilter === st} onClick={() => updateParams({ stage: st === 'All' ? null : st })} className={`cursor-pointer rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors ${stageFilter === st ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'}`}>
              {st} <span className="tabular-nums opacity-80">{stageCounts[st]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area Rendering Active View */}
      {jobsLoading || rankingsLoading ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Skeleton className="h-[480px] rounded-[14px]" />
          <Skeleton className="h-[480px] rounded-[14px]" />
        </div>
      ) : !candidates.length && !searchQuery && stageFilter === 'All' && !rawCandidates.length ? (
        <div className="flex min-h-[380px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8">
          <EmptyState
            title={activeView === 'board' ? 'No candidates in pipeline' : 'No candidates yet'}
            description={activeView === 'board' ? 'Upload resumes for this job opening to track candidates through your hiring stages.' : 'Choose a job and upload resumes to start reviewing candidates.'}
            action={<Button onClick={() => navigate('/studio/upload')}>Upload resumes</Button>}
          />
        </div>
      ) : (
        <>
          {activeView === 'list' && (
            <ListView candidates={candidates} activeJob={activeJob} activeJobId={activeJobId} selection={selection} workflow={workflow} computeBreakdownFn={computeBreakdown} />
          )}
          {activeView === 'table' && (
            <TableView candidates={candidates} rawCandidates={rawCandidates} activeJob={activeJob} activeJobId={activeJobId} selection={selection} workflow={workflow} isJobReScoring={isJobReScoring} sortBy={sortBy} sortOrder={sortOrder} onSort={(key, order) => updateParams({ sort: key, order })} />
          )}
          {activeView === 'board' && (
            <BoardView candidates={candidates} rawCandidates={rawCandidates} activeJob={activeJob} activeJobId={activeJobId} selection={selection} workflow={workflow} />
          )}
        </>
      )}

      {/* Floating Compare Bar */}
      {selection.selectedForCompare.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-[12px] border border-line bg-surface px-5 py-3 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <span className="text-[14px] font-semibold text-ink">Compare ({selection.selectedForCompare.length} candidates)</span>
          <Button variant="primary" size="sm" leftIcon={<GitCompare className="w-4 h-4" />} onClick={() => setIsCompareOpen(true)}>Compare now</Button>
          <button type="button" onClick={selection.clearCompare} className="p-1.5 rounded-[6px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors" title="Clear comparison selection"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareOpen && (
        <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} activeJobId={activeJobId} activeJob={activeJob} selectedAppIds={selection.selectedForCompare} rawCandidates={rawCandidates} />
      )}
    </div>
  );
}
