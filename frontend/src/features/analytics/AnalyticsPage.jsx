import { useParams, useNavigate } from 'react-router-dom';
import { useJobs, useJobAnalytics } from '../../hooks';
import { Select, Panel, StatStrip, useStatStripConfig, EmptyState, Skeleton, Button } from '../../components/ui';
import { STAGES } from '../candidates/constants';

export default function AnalyticsPage() {
  const { jobId: routeJobId } = useParams();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  // Active Job ID
  const activeJobId = routeJobId || (jobs.length > 0 ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((j) => String(j.job_id) === String(activeJobId));

  const { data: analytics, isLoading: analyticsLoading } = useJobAnalytics(activeJobId);

  const handleJobChange = (newJobId) => {
    navigate(`/studio/analytics/${newJobId}`);
  };

  const totalApps = analytics?.total_applications ?? activeJob?.application_count ?? 0;
  const totalProcessed = analytics?.total_processed ?? 0;
  const avgFinalScore = analytics?.average_final_score ?? analytics?.avg_final_score ?? 0;
  const avgKeywordScore = analytics?.average_keyword_score ?? analytics?.avg_keyword_score ?? 0;
  const duplicateCount = analytics?.duplicate_count ?? 0;
  const scoreBuckets = analytics?.score_buckets || {};
  const stageDist = analytics?.stage_distribution || {};

  const { processed, averageScore, duplicatesBlocked } = useStatStripConfig(analytics, {
    processed: {
      label: 'Applicants Screened',
      value: totalProcessed,
      caption: `${totalApps} total ${totalApps === 1 ? 'applicant' : 'applicants'}`,
    },
    averageScore: {
      score: totalProcessed > 0 ? avgFinalScore : 0,
      caption: 'Dual-track fit average',
    },
    duplicatesBlocked: {
      count: duplicateCount,
      caption: 'SHA-256 hash collisions',
    },
  });

  const statItems = [
    processed,
    averageScore,
    {
      label: 'Skills Covered Rate',
      value: totalProcessed > 0 ? `${Number(avgKeywordScore).toFixed(1)}%` : '0.0%',
      caption: 'Keyword verification',
    },
    duplicatesBlocked,
  ];

  // Matched and missing skills data from real database metrics
  const skillFrequency = (analytics?.most_common_matched_skills || []).map((item) => {
    const percent = totalProcessed > 0 ? (item.count / totalProcessed) * 100 : 0;
    return {
      skill: item.skill,
      count: item.count,
      total: totalProcessed,
      percent,
    };
  });

  const missingSkills = (analytics?.most_frequently_missing_skills || []).map((item) => {
    const percent = totalProcessed > 0 ? (item.count / totalProcessed) * 100 : 0;
    return {
      skill: item.skill,
      missingCount: item.count,
      percent,
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
        <div>
          <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
            Skill Gap Analytics
          </h1>
          <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
            Aggregate competency frequency, talent pool coverage, and missing qualification trends.
          </p>
        </div>

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
      </div>

      {/* 1. Stat Strip */}
      <StatStrip items={statItems} />

      {/* Analytics Content */}
      {jobsLoading || analyticsLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-[14px]" />
            <Skeleton className="h-64 w-full rounded-[14px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-72 w-full rounded-[14px]" />
            <Skeleton className="h-72 w-full rounded-[14px]" />
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs to analyze"
          description="Create a job opening and ingest candidate resumes to view analytics."
          action={
            <Button size="sm" onClick={() => navigate('/studio/jobs')}>
              Create job opening
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Score & Stage Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Panel className="p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Score distribution</h2>
                <p className="text-[13px] leading-[1.5] text-ink-muted">
                  Candidate suitability distribution across score tiers.
                </p>
              </div>

              {totalProcessed === 0 ? (
                <div className="py-8 text-center text-[13px] text-ink-muted">
                  No evaluated candidates to display score tiers.
                </div>
              ) : (
                <div className="space-y-3">
                  {['80-100%', '60-79%', '40-59%', '<40%'].map((bucket) => {
                    const count = scoreBuckets[bucket] ?? 0;
                    const pct = totalProcessed > 0 ? (count / totalProcessed) * 100 : 0;
                    return (
                      <div key={bucket} className="space-y-1">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-medium text-ink">{bucket}</span>
                          <span className="text-ink-muted tabular-nums">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              bucket === '80-100%'
                                ? 'bg-primary'
                                : bucket === '60-79%'
                                ? 'bg-champagne'
                                : 'bg-line'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Stage Distribution */}
            <Panel className="p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Review pipeline stages</h2>
                <p className="text-[13px] leading-[1.5] text-ink-muted">
                  Current applicant progression across hiring stages.
                </p>
              </div>

              {totalApps === 0 ? (
                <div className="py-8 text-center text-[13px] text-ink-muted">
                  No applicants in the review pipeline yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {STAGES.map((stage) => {
                    const count = stageDist[stage] ?? stageDist[stage === 'Interviewing' ? 'Interview' : stage] ?? 0;
                    return (
                      <div
                        key={stage}
                        className="p-3.5 rounded-[10px] bg-surface-alt/40 border border-line space-y-1"
                      >
                        <div className="text-[13px] font-medium text-ink-muted">{stage}</div>
                        <div className="text-[22px] font-semibold text-ink tabular-nums leading-none">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          {/* 2-Column Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills Frequency (Horizontal Bars with Right-Aligned Values, Matched in Primary) */}
            <Panel className="p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Verified skill coverage</h2>
                <p className="text-[13px] leading-[1.5] text-ink-muted">
                  Percentage of applicants possessing required competencies.
                </p>
              </div>

              {skillFrequency.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-[13px] text-ink-muted">
                    No verified skill coverage data available yet.
                  </p>
                  <p className="text-[13px] text-ink-subtle">
                    Upload and evaluate resumes to view competency distribution.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skillFrequency.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-ink">{item.skill}</span>
                        <span className="text-ink font-semibold tabular-nums text-right">
                          {item.count} / {item.total} ({item.percent.toFixed(0)}%)
                        </span>
                      </div>
                      {/* Horizontal bar in primary */}
                      <div className="h-2.5 w-full rounded-full bg-surface-alt overflow-hidden">
                        <div
                          style={{ width: `${item.percent}%` }}
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Missing Skills Frequency (Missing in Champagne-Soft with Champagne Border) */}
            <Panel className="p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Common skill gaps</h2>
                <p className="text-[13px] leading-[1.5] text-ink-muted">
                  Competencies most frequently absent in the applicant pool.
                </p>
              </div>

              {missingSkills.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-[13px] text-ink-muted">
                    No skill gaps detected in applicant pool.
                  </p>
                  <p className="text-[13px] text-ink-subtle">
                    Upload and evaluate resumes to identify missing qualifications.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {missingSkills.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-ink">{item.skill}</span>
                        <span className="text-champagne font-semibold tabular-nums text-right">
                          Missing in {item.missingCount} {item.missingCount === 1 ? 'resume' : 'resumes'} ({item.percent.toFixed(0)}%)
                        </span>
                      </div>
                      {/* Horizontal bar in champagne-soft with champagne border */}
                      <div className="h-2.5 w-full rounded-full bg-surface-alt overflow-hidden">
                        <div
                          style={{ width: `${item.percent}%` }}
                          className="h-full bg-champagne-soft border border-champagne transition-all duration-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
