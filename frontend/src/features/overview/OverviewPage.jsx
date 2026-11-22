import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, UploadCloud, RefreshCw } from 'lucide-react';
import { useOverviewAnalytics, useJobs } from '../../hooks';
import {
  StatStrip,
  Panel,
  Button,
  EmptyState,
  Skeleton,
  Avatar,
  ScoreBar,
  ScoreValue,
} from '../../components/ui';
import ScoreHistogram from './ScoreHistogram';
import PipelineFunnel from './PipelineFunnel';

const CANONICAL_STAGE_META = [
  { stage: 'New', desc: 'Awaiting review', borderTone: 'border-l-line' },
  { stage: 'Reviewing', desc: 'Screen in progress', borderTone: 'border-l-slate-steel' },
  { stage: 'Interviewing', desc: 'Panel scheduled', borderTone: 'border-l-primary' },
  { stage: 'Offer', desc: 'Offer extended', borderTone: 'border-l-[#5B638A]' },
  { stage: 'Hired', desc: 'Offer accepted', borderTone: 'border-l-[#2E7259]' },
  { stage: 'Rejected', desc: 'Archived records', borderTone: 'border-l-line/60' },
];

export default function OverviewPage() {
  const navigate = useNavigate();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
    isFetching: analyticsFetching,
    dataUpdatedAt,
  } = useOverviewAnalytics();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  const defaultJobId = jobs.length > 0 ? jobs[0].job_id : null;
  const isLoading = analyticsLoading || jobsLoading;

  // Process 6 non-overlapping histogram buckets from clean backend contract
  const histogramBuckets = useMemo(() => {
    const raw = analytics?.score_histogram || [];
    if (raw.length === 6) {
      return raw.map((b) => ({
        label: b.label,
        min: b.min,
        max: b.max,
        count: b.count,
        tone: b.min >= 80 ? 'high' : b.min >= 60 ? 'mid' : 'low',
      }));
    }
    // Default empty 6 tiers
    return [
      { label: '0–49%', min: 0, max: 49.99, count: 0, tone: 'low' },
      { label: '50–59%', min: 50, max: 59.99, count: 0, tone: 'low' },
      { label: '60–69%', min: 60, max: 69.99, count: 0, tone: 'mid' },
      { label: '70–79%', min: 70, max: 79.99, count: 0, tone: 'mid' },
      { label: '80–89%', min: 80, max: 89.99, count: 0, tone: 'high' },
      { label: '90–100%', min: 90, max: 100, count: 0, tone: 'high' },
    ];
  }, [analytics?.score_histogram]);

  const evaluatedCount = useMemo(() => {
    if (analytics?.totals?.completed != null) {
      return analytics.totals.completed;
    }
    return histogramBuckets.reduce((acc, b) => acc + (b.count || 0), 0);
  }, [analytics?.totals?.completed, histogramBuckets]);

  const maxBucketCount = Math.max(...histogramBuckets.map((b) => b.count), 1);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-28 w-full rounded-[14px]" />
        <Skeleton className="h-36 w-full rounded-[14px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-[14px]" />
          <Skeleton className="h-64 rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <Panel className="p-8 text-center space-y-4">
        <h3 className="text-[17px] font-semibold text-ink leading-[1.35]">Failed to load overview data</h3>
        <p className="text-[15px] leading-[1.6] text-ink-muted">
          An error occurred while fetching system statistics.
        </p>
        <Button variant="secondary" onClick={() => refetchAnalytics()}>
          Retry
        </Button>
      </Panel>
    );
  }

  const totals = analytics?.totals || {};
  const totalApps = totals.applications ?? 0;
  const completedApps = totals.completed ?? 0;
  const activeJobs = totals.active_jobs ?? jobs.length;
  const avgScore = Number(analytics?.average_score ?? 0);
  const dupBlocked = totals.duplicates_blocked ?? 0;

  const statItems = [
    {
      label: 'Job Openings',
      value: totals.jobs ?? jobs.length,
      caption: `${activeJobs} active ${activeJobs === 1 ? 'position' : 'positions'}`,
    },
    {
      label: 'Total Applications',
      value: totalApps,
      caption: `${completedApps} completed`,
    },
    {
      label: 'Average Score',
      value: `${avgScore.toFixed(1)}%`,
      caption: 'Completed match average',
    },
    {
      label: 'Duplicates Blocked',
      value: dupBlocked,
      caption: 'SHA-256 hash matches',
    },
  ];

  const stageDistribution = analytics?.stage_distribution || {};
  const pipelineStages = CANONICAL_STAGE_META.map((meta) => ({
    ...meta,
    count: stageDistribution[meta.stage] ?? 0,
  }));

  const topCandidates = analytics?.top_candidates || [];

  const lastUpdatedText = dataUpdatedAt
    ? `Last updated ${new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
              Overview
            </h1>
            {lastUpdatedText && (
              <span className="text-[12px] text-ink-muted bg-surface-alt px-2.5 py-1 rounded-[6px] border border-line">
                {lastUpdatedText}
              </span>
            )}
            <button
              type="button"
              onClick={() => refetchAnalytics()}
              disabled={analyticsFetching}
              title="Refresh overview metrics"
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-alt rounded-[6px] border border-transparent hover:border-line transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyticsFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
            Recruitment pipeline metrics, applicant review stages, and candidate fit benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" strokeWidth={1.75} />}
            onClick={() => navigate('/studio/upload')}
          >
            Upload resumes
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" strokeWidth={1.75} />}
            onClick={() => navigate('/studio/jobs')}
          >
            Manage jobs
          </Button>
        </div>
      </div>

      {/* 1. Stat Strip (single-panel with dividers) */}
      <StatStrip items={statItems} />

      {/* 2. Applicant Review Pipeline */}
      <PipelineFunnel pipelineStages={pipelineStages} defaultJobId={defaultJobId} />

      {/* 3. 2-Column Grid: 6-Bucket Histogram + Top Candidates List with Avatar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution: Clean 6-Bucket Histogram */}
        <ScoreHistogram
          histogramBuckets={histogramBuckets}
          totalEvaluated={evaluatedCount}
          maxBucketCount={maxBucketCount}
        />

        {/* Top Candidates List with <Avatar> (Platform-Wide) */}
        <Panel className="lg:col-span-6 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Top Candidates</h2>
              <p className="text-[13px] text-ink-muted mt-0.5">Top scorers across all active positions</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/studio/candidates')}
              className="text-[13px] text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {topCandidates.length === 0 ? (
            <EmptyState
              title="No candidates evaluated yet"
              description="Upload candidate resumes to see top scorers here."
              action={
                <Button size="sm" variant="secondary" onClick={() => navigate('/studio/upload')}>
                  Upload resume
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {topCandidates.map((candidate, idx) => {
                const score = Number(candidate.final_score ?? 0);
                const stage = candidate.stage || 'New';
                const appId = candidate.application_id;

                return (
                  <div
                    key={appId || idx}
                    onClick={() => navigate(appId ? `/studio/candidates?candidate=${appId}` : '/studio/candidates')}
                    className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-surface-alt/40 px-2 rounded-[8px] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={candidate.name} size="md" />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold tabular-nums text-ink-muted">
                            #{idx + 1}
                          </span>
                          <span className="text-[15px] font-semibold text-ink truncate leading-[1.4]">
                            {candidate.name || 'Candidate'}
                          </span>
                        </div>
                        <div className="text-[13px] leading-[1.5] text-ink-muted flex items-center gap-2 truncate">
                          <span className="truncate">{candidate.job_title || 'Position'}</span>
                          <span className="text-ink-subtle">·</span>
                          <span className="font-medium text-ink">{stage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-36 shrink-0 flex items-center gap-3">
                      <div className="w-20">
                        <ScoreBar
                          finalScore={score}
                          height="h-1.5"
                        />
                      </div>
                      <ScoreValue score={score} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
