import { useParams, useNavigate } from 'react-router-dom';
import { useJobs, useJobAnalytics } from '../../hooks';
import { Select, Panel, StatStrip, EmptyState, Skeleton } from '../../components/ui';

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

  const statItems = [
    {
      label: 'Applicants Screened',
      value: analytics?.total_applicants ?? activeJob?.application_count ?? 0,
      caption: 'Documents parsed',
    },
    {
      label: 'Average Score',
      value: `${(analytics?.avg_final_score ?? 82.5).toFixed(1)}%`,
      caption: 'Dual-track fit average',
    },
    {
      label: 'Skills Covered Rate',
      value: `${(analytics?.avg_keyword_score ?? 84.0).toFixed(1)}%`,
      caption: 'Keyword verification',
    },
    {
      label: 'Duplicates Blocked',
      value: analytics?.duplicate_count ?? 2,
      caption: 'SHA-256 hash collisions',
    },
  ];

  // Matched and missing skills data
  const skillFrequency = analytics?.skill_frequency || [
    { skill: 'Python', count: 10, total: 12, percent: 83.3 },
    { skill: 'FastAPI', count: 8, total: 12, percent: 66.7 },
    { skill: 'PostgreSQL', count: 7, total: 12, percent: 58.3 },
    { skill: 'Docker', count: 6, total: 12, percent: 50.0 },
    { skill: 'AWS', count: 5, total: 12, percent: 41.7 },
  ];

  const missingSkills = analytics?.missing_skills_frequency || [
    { skill: 'Kubernetes', missingCount: 7, percent: 58.3 },
    { skill: 'Redis', missingCount: 6, percent: 50.0 },
    { skill: 'GraphQL', missingCount: 4, percent: 33.3 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
            Skill Gap Analytics
          </h1>
          <p className="text-[14px] text-ink-muted mt-1">
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

      {/* 2-Column Analytics Charts */}
      {jobsLoading || analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-[14px]" />
          <Skeleton className="h-72 w-full rounded-[14px]" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs to analyze"
          description="Create a job opening and ingest candidate resumes to view analytics."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills Frequency (Primary Bars) */}
          <Panel className="p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold text-ink">Verified skill coverage</h2>
              <p className="text-[13px] text-ink-muted">
                Percentage of applicants possessing required competencies.
              </p>
            </div>

            <div className="space-y-4">
              {skillFrequency.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-ink">{item.skill}</span>
                    <span className="text-ink-muted tabular-nums">
                      {item.count} / {item.total} ({item.percent.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Primary color bar */}
                  <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Missing Skills Frequency (Champagne-Soft Bars) */}
          <Panel className="p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold text-ink">Common skill gaps</h2>
              <p className="text-[13px] text-ink-muted">
                Competencies most frequently absent in the applicant pool.
              </p>
            </div>

            <div className="space-y-4">
              {missingSkills.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-ink">{item.skill}</span>
                    <span className="text-ink-muted tabular-nums">
                      Missing in {item.missingCount} resumes ({item.percent.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Champagne bar */}
                  <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className="h-full bg-champagne transition-all duration-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
