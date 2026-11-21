import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  UploadCloud,
  GitCompare,
  AlertCircle,
} from 'lucide-react';
import { useJobs, useRankings } from '../../hooks';
import { computeBreakdown } from '../../lib/score';
import { cleanCandidateName } from '../../lib/format';
import {
  Panel,
  Button,
  EmptyState,
  Skeleton,
  Avatar,
  Input,
  Select,
  Drawer,
  Badge,
} from '../../components/ui';
import {
  STAGES,
  getStageConfig,
  CandidateDetail,
  useStageWorkflow,
  useCandidateSelection,
  useCandidateKeyboard,
} from '../candidates';

/**
 * Normalizes legacy or non-standard review stages to canonical STAGES list.
 */
function normalizeStage(stage) {
  if (!stage) return 'New';
  if (stage === 'Interview') return 'Interviewing';
  const match = STAGES.find((s) => s.toLowerCase() === String(stage).toLowerCase());
  return match || 'New';
}

/**
 * Stage accent colors for column header accents, borders, and dots.
 */
const STAGE_ACCENT_MAP = {
  New: {
    border: 'border-t-ink-muted/40',
    dot: 'bg-ink-muted',
    bgBadge: 'bg-surface-alt text-ink-muted border-line',
  },
  Reviewing: {
    border: 'border-t-champagne',
    dot: 'bg-champagne',
    bgBadge: 'bg-champagne-soft text-ink border-champagne/40',
  },
  Interviewing: {
    border: 'border-t-primary',
    dot: 'bg-primary',
    bgBadge: 'bg-primary/10 text-primary border-primary/30',
  },
  Offer: {
    border: 'border-t-purple-500',
    dot: 'bg-purple-500',
    bgBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  Hired: {
    border: 'border-t-emerald-500',
    dot: 'bg-emerald-500',
    bgBadge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  Rejected: {
    border: 'border-t-rose-500',
    dot: 'bg-rose-500',
    bgBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
};

export default function PipelinePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlJobId = searchParams.get('jobId');
  const urlCandidateId = searchParams.get('candidate') || searchParams.get('candidateId');

  // Job selection
  const { data: jobsList = [], isLoading: jobsLoading } = useJobs();
  const activeJobId = urlJobId ? Number(urlJobId) : jobsList[0]?.job_id || null;

  const handleSelectJob = (id) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('jobId', String(id));
      p.delete('candidate');
      p.delete('candidateId');
      return p;
    });
    setIsDrawerOpen(false);
  };

  // Active Job details
  const activeJob = useMemo(
    () => jobsList.find((j) => j.job_id === activeJobId) || jobsList[0] || null,
    [jobsList, activeJobId]
  );

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

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(urlCandidateId));

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    let list = [...rawCandidates];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        const name = (c.candidate_name || '').toLowerCase();
        const email = (c.candidate_email || '').toLowerCase();
        const skills = Array.isArray(c.matched_skills)
          ? c.matched_skills.join(' ').toLowerCase()
          : '';
        return name.includes(q) || email.includes(q) || skills.includes(q);
      });
    }
    return list;
  }, [rawCandidates, searchQuery]);

  // Candidate selection hook
  const {
    selectedCandidate,
    effectiveCandidateId,
    setSelectedCandidateId,
    safeSelectedIndex,
    selectedForCompare,
    handleToggleCompare,
    handleInitiateCompare,
  } = useCandidateSelection(filteredCandidates, {
    activeJobId,
    defaultToFirst: false,
    initialId: urlCandidateId,
  });

  // Stage workflow hook
  const stageWorkflow = useStageWorkflow(activeJobId, selectedCandidate);

  // Compute breakdown for selected candidate
  const selectedBreakdown = useMemo(() => {
    if (!selectedCandidate) return null;
    return computeBreakdown(selectedCandidate, activeJob);
  }, [selectedCandidate, activeJob]);

  // Card click handler: open slide-over drawer
  const handleOpenCandidateDrawer = useCallback(
    (appId) => {
      setSelectedCandidateId(appId);
      setIsDrawerOpen(true);
    },
    [setSelectedCandidateId]
  );

  // Close drawer
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedCandidateId(null);
  }, [setSelectedCandidateId]);

  // Keyboard navigation hook
  useCandidateKeyboard({
    candidates: filteredCandidates,
    selectedIndex: safeSelectedIndex,
    onSelectCandidate: (appId) => {
      setSelectedCandidateId(appId);
      setIsDrawerOpen(true);
    },
    onClose: handleCloseDrawer,
    onEscape: handleCloseDrawer,
    enabled: true,
  });

  // Group candidates by Kanban stage
  const candidatesByStage = useMemo(() => {
    const map = {};
    STAGES.forEach((stage) => {
      map[stage] = [];
    });

    filteredCandidates.forEach((cand) => {
      const stage = normalizeStage(cand.review_stage);
      if (map[stage]) {
        map[stage].push(cand);
      } else {
        map.New.push(cand);
      }
    });

    return map;
  }, [filteredCandidates]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Active Job Selector, Title, Counts, Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-line pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] font-semibold tracking-tight text-ink">
              Pipeline Board
            </h1>
            <Badge variant="default" className="text-[12px] font-medium">
              {rawCandidates.length} {rawCandidates.length === 1 ? 'candidate' : 'candidates'}
            </Badge>
            {activeJob && (
              <span className="text-[13px] text-ink-muted">
                • {activeJob.title}
              </span>
            )}
          </div>
          <p className="text-[14px] text-ink-muted">
            Visualize applicant progression, move stages, and evaluate dossiers.
          </p>
        </div>

        {/* Controls: Job Switcher, Search, Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Job Selector */}
          <div className="w-56 sm:w-64">
            <Select
              value={activeJobId || ''}
              onChange={(e) => handleSelectJob(Number(e.target.value))}
              disabled={jobsLoading || jobsList.length === 0}
              aria-label="Select Job"
            >
              {jobsList.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Search Input */}
          <div className="w-52 sm:w-64">
            <Input
              type="text"
              placeholder="Filter candidates, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />}
            />
          </div>

          {/* Compare Button (when candidates selected) */}
          {selectedForCompare.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleInitiateCompare}
              leftIcon={<GitCompare className="w-4 h-4" strokeWidth={1.75} />}
            >
              Compare ({selectedForCompare.length})
            </Button>
          )}

          {/* Upload Resumes CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(
                activeJobId ? `/studio/upload?jobId=${activeJobId}` : '/studio/upload'
              )
            }
            leftIcon={<UploadCloud className="w-4 h-4" strokeWidth={1.75} />}
          >
            Upload Resumes
          </Button>
        </div>
      </div>

      {/* 2. Main Kanban Board View */}
      {jobsLoading || rankingsLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <div
              key={s}
              className="w-72 sm:w-80 shrink-0 bg-surface-alt/40 border border-line rounded-[14px] p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <Skeleton className="h-28 w-full rounded-[10px]" />
              <Skeleton className="h-28 w-full rounded-[10px]" />
              <Skeleton className="h-28 w-full rounded-[10px]" />
            </div>
          ))}
        </div>
      ) : rankingsError ? (
        <Panel className="p-8 text-center space-y-4">
          <div className="flex items-center justify-center text-danger">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-danger text-[14px] font-medium">
            Failed to load candidates for pipeline.
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Panel>
      ) : rawCandidates.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-ink-muted" strokeWidth={1.75} />}
          title="No candidates in pipeline"
          description="Upload resumes for this job opening to begin moving applicants through recruitment stages."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate(
                  activeJobId ? `/studio/upload?jobId=${activeJobId}` : '/studio/upload'
                )
              }
              leftIcon={<UploadCloud className="w-4 h-4" strokeWidth={1.75} />}
            >
              Upload Resumes
            </Button>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[640px]">
          {STAGES.map((stage) => {
            const stageConfig = getStageConfig(stage);
            const accent = STAGE_ACCENT_MAP[stage] || STAGE_ACCENT_MAP.New;
            const stageCandidates = candidatesByStage[stage] || [];

            return (
              <div
                key={stage}
                className={`w-72 sm:w-80 shrink-0 bg-surface-alt/30 border border-line rounded-[14px] flex flex-col max-h-[calc(100vh-210px)] border-t-4 ${accent.border}`}
              >
                {/* Column Header */}
                <div className="px-3.5 py-3 border-b border-line/70 flex items-center justify-between bg-surface/50 rounded-t-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${accent.dot}`} />
                    <span className="text-[14px] font-semibold text-ink">
                      {stageConfig.label || stage}
                    </span>
                  </div>
                  <span
                    className={`text-[12px] font-semibold px-2 py-0.5 rounded-full border ${accent.bgBadge}`}
                  >
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards Column */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[140px]">
                  {stageCandidates.length === 0 ? (
                    <div className="h-28 rounded-[10px] border border-dashed border-line flex flex-col items-center justify-center text-center p-3 text-ink-subtle">
                      <p className="text-[12px]">No candidates</p>
                      <span className="text-[11px] text-ink-muted/70 mt-0.5">
                        Move applicants here
                      </span>
                    </div>
                  ) : (
                    stageCandidates.map((cand) => {
                      const score = Math.round(
                        cand.final_score ?? cand.overall_score ?? 0
                      );
                      const isSelected =
                        effectiveCandidateId &&
                        String(cand.application_id) === String(effectiveCandidateId);

                      return (
                        <div
                          key={cand.application_id}
                          onClick={() => handleOpenCandidateDrawer(cand.application_id)}
                          className={`bg-surface border rounded-[12px] p-3.5 shadow-xs transition-all cursor-pointer group hover:shadow-md hover:border-ink-subtle ${
                            isSelected
                              ? 'border-primary ring-1 ring-primary bg-champagne-soft/10'
                              : 'border-line'
                          }`}
                        >
                          {/* Top row: Rank badge & Score badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[4px] bg-surface-alt border border-line text-ink-muted">
                              #{cand.rank ?? '—'}
                            </span>

                            <span
                              className={`text-[12px] font-bold px-2 py-0.5 rounded-[6px] border ${
                                score >= 85
                                  ? 'bg-champagne/30 text-ink border-champagne/40'
                                  : score >= 70
                                  ? 'bg-primary/10 text-primary border-primary/30'
                                  : 'bg-surface-alt text-ink-muted border-line'
                              }`}
                            >
                              {score}% match
                            </span>
                          </div>

                          {/* Candidate info: Avatar, Name, Experience */}
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <Avatar
                              name={cand.candidate_name}
                              size="md"
                              className="shrink-0 mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[14px] font-semibold text-ink group-hover:text-primary transition-colors truncate">
                                {cleanCandidateName(cand.candidate_name)}
                              </h4>
                              <p className="text-[12px] text-ink-muted truncate">
                                {cand.experience_years !== undefined &&
                                cand.experience_years !== null
                                  ? `${cand.experience_years} yrs`
                                  : 'Experience N/A'}{' '}
                                • {cand.seniority_level || 'Candidate'}
                              </p>
                            </div>
                          </div>

                          {/* Key Skills Tags */}
                          {Array.isArray(cand.matched_skills) &&
                            cand.matched_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {cand.matched_skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="text-[11px] px-2 py-0.5 rounded-[6px] bg-surface-alt text-ink-muted border border-line truncate max-w-[140px]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {cand.matched_skills.length > 3 && (
                                  <span className="text-[10px] px-1 py-0.5 text-ink-subtle">
                                    +{cand.matched_skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                          {/* Quick Stage Mover directly on Card */}
                          <div
                            className="pt-2 border-t border-line/60 flex items-center justify-between text-[12px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-ink-subtle text-[11px]">Move to:</span>
                            <select
                              value={normalizeStage(cand.review_stage)}
                              onChange={(e) =>
                                stageWorkflow.handleQuickStageChange(cand, e.target.value)
                              }
                              className="text-[12px] py-0.5 px-2 rounded-[6px] border border-line bg-surface hover:border-ink-subtle text-ink cursor-pointer focus:outline-none"
                              aria-label={`Move ${cleanCandidateName(cand.candidate_name)} stage`}
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Slide-over Drawer for CandidateDetail */}
      <Drawer
        isOpen={Boolean(selectedCandidate && isDrawerOpen)}
        onClose={handleCloseDrawer}
        title={
          selectedCandidate
            ? `${cleanCandidateName(selectedCandidate.candidate_name)} — Dossier`
            : 'Candidate Dossier'
        }
        maxWidth="max-w-3xl"
      >
        {selectedCandidate && (
          <CandidateDetail
            candidate={selectedCandidate}
            breakdown={selectedBreakdown}
            activeJob={activeJob}
            safeSelectedIndex={safeSelectedIndex}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
            stageWorkflow={stageWorkflow}
          />
        )}
      </Drawer>
    </div>
  );
}