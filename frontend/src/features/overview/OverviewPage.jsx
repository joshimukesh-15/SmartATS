import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, UploadCloud } from 'lucide-react';
import { useOverviewAnalytics, useJobs, useRankings } from '../../hooks';
import {
  StatStrip,
  Panel,
  ScoreBar,
  ScoreValue,
  Button,
  EmptyState,
  Skeleton,
  Avatar,
} from '../../components/ui';
import ScoreHistogram from './ScoreHistogram';
import PipelineFunnel from './PipelineFunnel';
import { cleanCandidateName } from '../../lib/format';
import { computeBreakdown } from '../../lib/score';

export default function OverviewPage() {
  const navigate = useNavigate();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useOverviewAnalytics();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  // First job to load top candidates & ranking benchmarks
  const defaultJobId = jobs.length > 0 ? jobs[0].job_id : null;
  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(defaultJobId);

  const isLoading = analyticsLoading || jobsLoading;

  // 6-bucket histogram calculations
  const histogramBuckets = useMemo(() => {
    const candidates = rankingsData?.rankings || [];
    const buckets = [
      { label: '0–49%', min: 0, max: 49.99, count: 0, tone: 'low' },
      { label: '50–59%', min: 50, max: 59.99, count: 0, tone: 'low' },
      { label: '60–69%', min: 60, max: 69.99, count: 0, tone: 'mid' },
      { label: '70–79%', min: 70, max: 79.99, count: 0, tone: 'mid' },
      { label: '80–89%', min: 80, max: 89.99, count: 0, tone: 'high' },
      { label: '90–100%', min: 90, max: 100, count: 0, tone: 'high' },
    ];

    const sd = analytics?.score_distribution || analytics?.score_buckets || {};
    const high = sd['80-100%'] || 0;
    const mid = sd['60-79%'] || 0;
    const low = sd['<60%'] || (sd['40-59%'] || 0) + (sd['<40%'] || 0);

    if (high > 0 || mid > 0 || low > 0) {
      buckets[0].count = Math.floor(low / 2);
      buckets[1].count = Math.ceil(low / 2);
      buckets[2].count = Math.floor(mid / 2);
      buckets[3].count = Math.ceil(mid / 2);
      buckets[4].count = Math.floor(high / 2);
      buckets[5].count = Math.ceil(high / 2);
    } else if (candidates.length > 0) {
      candidates.forEach((c) => {
        const score = c.final_score ?? 0;
        const bucket = buckets.find((b) => score >= b.min && score <= b.max);
        if (bucket) bucket.count++;
      });
    }
    return buckets;
  }, [rankingsData, analytics]);

  const evaluatedCount = useMemo(() => {
    const sd = analytics?.score_distribution || analytics?.score_buckets || {};
    const sumFromBuckets = Object.values(sd).reduce((a, b) => a + Number(b || 0), 0);
    return (
      sumFromBuckets ||
      analytics?.processed_resumes ||
      analytics?.total_processed ||
      analytics?.total_candidates ||
      analytics?.total_applications ||
      (rankingsData?.rankings?.length ?? 0)
    );
  }, [analytics, rankingsData]);

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

  const avgScore = analytics?.average_score ?? analytics?.avg_final_score ?? 0;
  const statItems = [
    {
      label: 'Job Openings',
      value: analytics?.total_jobs ?? jobs.length,
      caption: 'Active positions',
    },
    {
      label: 'Total Applications',
      value: analytics?.total_applications ?? 0,
      caption: 'Ingested resumes',
    },
    {
      label: 'Average Score',
      value: `${Number(avgScore).toFixed(1)}%`,
      caption: 'Composite candidate fit',
    },
    {
      label: 'Duplicates Blocked',
      value: analytics?.duplicate_resumes ?? analytics?.duplicate_count ?? 0,
      caption: 'SHA-256 hash matches',
    },
  ];

  const topCandidates = rankingsData?.rankings?.slice(0, 4) || [];
  const stageDistribution = analytics?.stage_distribution || {
    New: 0,
    Reviewing: 0,
    Interview: 0,
    Hired: 0,
    Rejected: 0,
  };

  const pipelineStages = [
    { stage: 'New', count: stageDistribution.New ?? 0, desc: 'Awaiting review', borderTone: 'border-l-line' },
    { stage: 'Reviewing', count: stageDistribution.Reviewing ?? 0, desc: 'Screen in progress', borderTone: 'border-l-champagne' },
    { stage: 'Interview', count: stageDistribution.Interview ?? 0, desc: 'Panel scheduled', borderTone: 'border-l-primary' },
    { stage: 'Hired', count: stageDistribution.Hired ?? 0, desc: 'Offer accepted', borderTone: 'border-l-champagne' },
    { stage: 'Rejected', count: stageDistribution.Rejected ?? 0, desc: 'Archived records', borderTone: 'border-l-line/60' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
        <div>
          <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
            Overview
          </h1>
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

        {/* Top Candidates List with <Avatar> */}
        <Panel className="lg:col-span-6 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Top Candidates</h2>
            {defaultJobId && (
              <button
                type="button"
                onClick={() => navigate(`/studio/leaderboard/${defaultJobId}`)}
                className="text-[13px] text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>

          {rankingsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : topCandidates.length === 0 ? (
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
                const breakdown = computeBreakdown(candidate);
                const stage = candidate.review_stage || 'New';
                return (
                  <div
                    key={candidate.application_id || idx}
                    className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar with deterministic tint */}
                      <Avatar name={candidate.candidate_name} size="md" />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold tabular-nums text-ink-muted">
                            #{candidate.rank || idx + 1}
                          </span>
                          <span className="text-[15px] font-semibold text-ink truncate leading-[1.4]">
                            {cleanCandidateName(candidate.candidate_name)}
                          </span>
                        </div>
                        <div className="text-[13px] leading-[1.5] text-ink-muted flex items-center gap-2 truncate">
                          <span>{candidate.candidate_email || 'Verified application'}</span>
                          <span className="text-ink-subtle">·</span>
                          <span className="font-medium text-ink">{stage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-36 shrink-0 flex items-center gap-3">
                      <div className="w-20">
                        <ScoreBar
                          skillsPoints={breakdown.skillsCoveredPoints}
                          textMatchPoints={breakdown.textMatchPoints}
                          finalScore={breakdown.finalScore}
                          height="h-1.5"
                        />
                      </div>
                      <ScoreValue score={breakdown.finalScore} size="sm" />
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
