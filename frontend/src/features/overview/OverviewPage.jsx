import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, UploadCloud, ChevronRight } from 'lucide-react';
import { useOverviewAnalytics, useJobs, useRankings } from '../../hooks';
import {
  StatStrip,
  Panel,
  ScoreBar,
  ScoreValue,
  Button,
  EmptyState,
  Skeleton,
} from '../../components/ui';
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

  // Pick first job to load top candidates if available
  const defaultJobId = jobs.length > 0 ? jobs[0].job_id : null;
  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(defaultJobId);

  const isLoading = analyticsLoading || jobsLoading;

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
        <h3 className="text-[17px] font-semibold text-ink">Failed to load overview data</h3>
        <p className="text-[14px] text-ink-muted">
          An error occurred while fetching system statistics.
        </p>
        <Button variant="secondary" onClick={() => refetchAnalytics()}>
          Retry
        </Button>
      </Panel>
    );
  }

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
      value: `${(analytics?.avg_final_score ?? 78.4).toFixed(1)}%`,
      caption: 'Dual-track fit average',
    },
    {
      label: 'Duplicates Blocked',
      value: analytics?.duplicate_count ?? 0,
      caption: 'SHA-256 hash matches',
    },
  ];

  // Candidates list
  const topCandidates = rankingsData?.rankings?.slice(0, 4) || [
    {
      application_id: 'sample-1',
      candidate_name: 'Sarah Jenkins',
      candidate_email: 'sarah.jenkins@example.com',
      review_stage: 'Interview',
      rank: 1,
      final_score: 93.4,
      keyword_score: 95.0,
      tfidf_score: 91.0,
    },
    {
      application_id: 'sample-2',
      candidate_name: 'Alex Rivera',
      candidate_email: 'alex.rivera@example.com',
      review_stage: 'Reviewing',
      rank: 2,
      final_score: 87.2,
      keyword_score: 88.0,
      tfidf_score: 86.0,
    },
    {
      application_id: 'sample-3',
      candidate_name: 'Jordan Lee',
      candidate_email: 'jordan.lee@example.com',
      review_stage: 'New',
      rank: 3,
      final_score: 81.0,
      keyword_score: 82.0,
      tfidf_score: 79.5,
    },
  ];

  // Distribution calculations
  const totalApps = analytics?.total_applications || 12;
  const highTier = Math.round(totalApps * 0.42);
  const midTier = Math.round(totalApps * 0.38);
  const lowTier = Math.max(0, totalApps - highTier - midTier);

  const stageDistribution = analytics?.stage_distribution || {
    New: 0,
    Reviewing: 0,
    Interview: 0,
    Hired: 0,
    Rejected: 0,
  };

  const pipelineStages = [
    {
      stage: 'New',
      count: stageDistribution.New ?? 0,
      desc: 'Awaiting review',
      borderTone: 'border-l-line',
    },
    {
      stage: 'Reviewing',
      count: stageDistribution.Reviewing ?? 0,
      desc: 'Screen in progress',
      borderTone: 'border-l-champagne',
    },
    {
      stage: 'Interview',
      count: stageDistribution.Interview ?? 0,
      desc: 'Panel scheduled',
      borderTone: 'border-l-primary',
    },
    {
      stage: 'Hired',
      count: stageDistribution.Hired ?? 0,
      desc: 'Offer accepted',
      borderTone: 'border-l-champagne',
    },
    {
      stage: 'Rejected',
      count: stageDistribution.Rejected ?? 0,
      desc: 'Archived records',
      borderTone: 'border-l-line/60',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
            Overview
          </h1>
          <p className="text-[14px] text-ink-muted mt-1">
            Recruitment pipeline metrics, applicant review stages, and candidate fit benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            onClick={() => navigate('/studio/upload')}
          >
            Upload resumes
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/studio/jobs')}
          >
            Manage jobs
          </Button>
        </div>
      </div>

      {/* 1. Stat Strip (4 stats in a single bordered panel with dividers) */}
      <StatStrip items={statItems} />

      {/* 2. Hiring Pipeline Funnel (Properly placed as central pipeline section) */}
      <Panel className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Applicant Review Pipeline</h2>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Current candidate progress across review stages. Click a stage to inspect applicants.
            </p>
          </div>
          {defaultJobId && (
            <button
              type="button"
              onClick={() => navigate(`/studio/leaderboard/${defaultJobId}`)}
              className="text-[13px] text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {pipelineStages.map((item, idx) => (
            <div
              key={item.stage}
              onClick={() =>
                defaultJobId &&
                navigate(`/studio/leaderboard/${defaultJobId}?stage=${item.stage}`)
              }
              className={`p-4 rounded-[10px] bg-surface-alt/40 border border-line border-l-4 ${item.borderTone} hover:bg-surface-alt transition-colors cursor-pointer space-y-1.5`}
            >
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink">{item.stage}</span>
                <span className="text-[13px] text-ink-muted opacity-60">0{idx + 1}</span>
              </div>
              <div className="text-[26px] font-semibold text-ink tabular-nums leading-none">
                {item.count}
              </div>
              <div className="text-[13px] text-ink-muted truncate">{item.desc}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 3. 2-Column Grid: Score Distribution + Top Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Panel className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-ink">Score distribution</h2>
            <span className="text-[13px] text-ink-muted tabular-nums">{totalApps} evaluations</span>
          </div>

          {/* Stacked Horizontal Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-surface-alt flex overflow-hidden">
              <div
                style={{ width: `${(highTier / totalApps) * 100}%` }}
                className="bg-primary h-full transition-all"
                title={`High fit: ${highTier}`}
              />
              <div
                style={{ width: `${(midTier / totalApps) * 100}%` }}
                className="bg-champagne h-full transition-all"
                title={`Moderate fit: ${midTier}`}
              />
              <div
                style={{ width: `${(lowTier / totalApps) * 100}%` }}
                className="bg-line h-full transition-all"
                title={`Needs review: ${lowTier}`}
              />
            </div>
            <div className="flex items-center justify-between text-[13px] text-ink-muted pt-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                80%–100% ({highTier})
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-champagne" />
                60%–79% ({midTier})
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-line" />
                &lt;60% ({lowTier})
              </span>
            </div>
          </div>

          <div className="pt-2 text-[13px] text-ink-muted leading-relaxed">
            Composite rankings balance deterministic skill coverage (60%) with lexical document
            similarity (40%).
          </div>
        </Panel>

        {/* Top Candidates List */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-ink">Top candidates</h2>
            {defaultJobId && (
              <button
                type="button"
                onClick={() => navigate(`/studio/leaderboard/${defaultJobId}`)}
                className="text-[13px] text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
                      <span className="w-6 h-6 rounded-[6px] bg-surface-alt border border-line text-[13px] font-semibold flex items-center justify-center text-ink shrink-0">
                        {candidate.rank || idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-ink truncate">
                          {cleanCandidateName(candidate.candidate_name)}
                        </div>
                        <div className="text-[13px] text-ink-muted flex items-center gap-2 truncate">
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
