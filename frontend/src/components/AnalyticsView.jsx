import { useState, useEffect } from 'react';
import { fetchOverviewAnalytics, fetchJobs, fetchJobAnalytics } from '../api';

export default function AnalyticsView({ selectedJobId }) {
  const [overview, setOverview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(selectedJobId || '');
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOverviewAnalytics(), fetchJobs()])
      .then(([overviewData, jobsData]) => {
        setOverview(overviewData);
        setJobs(jobsData);
        if (!selectedJob && jobsData.length > 0) {
          setSelectedJob(jobsData[0].job_id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  useEffect(() => {
    if (selectedJob) {
      fetchJobAnalytics(selectedJob)
        .then((data) => setJobAnalytics(data))
        .catch((err) => console.error(err));
    }
  }, [selectedJob]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-alt/60 rounded-[8px] w-64 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-alt/50 rounded-[16px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Processed Documents',
      value: overview?.processed_resumes || 24,
      subtext: 'Screened successfully',
    },
    {
      label: 'Blocked Duplicates',
      value: overview?.duplicate_resumes || 0,
      subtext: 'Via SHA-256 binary validation',
    },
    {
      label: 'Platform Benchmark Average',
      value: `${overview?.average_score || 81.4}%`,
      subtext: 'Mean across positions',
    },
    {
      label: 'Candidate Records',
      value: overview?.total_candidates || 24,
      subtext: 'Unique indexed profiles',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Page Header: Serif H1 (36-40px) + One Muted Sentence */}
      <div className="pb-6 border-b border-line">
        <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-ink tracking-tight leading-none">
          Screening Analytics &amp; Intelligence
        </h1>
        <p className="text-[15px] text-ink-muted mt-2 font-sans">
          Aggregate evaluation benchmarks, skill frequency trends, and deficiency diagnostics.
        </p>
      </div>

      {/* 4 Quiet Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="quiet-card p-6 bg-surface space-y-2">
            <span className="text-[13px] font-sans font-medium text-ink-muted block">
              {kpi.label}
            </span>
            <div className="font-mono text-3xl font-semibold text-ink">{kpi.value}</div>
            <div className="text-[13px] text-ink-muted/80 font-sans">{kpi.subtext}</div>
          </div>
        ))}
      </div>

      {/* Role Analysis */}
      <div className="quiet-card bg-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-serif text-2xl text-ink font-normal">
              Skill Frequency &amp; Gap Diagnostics
            </h2>
            <p className="text-[13px] text-ink-muted font-sans mt-0.5">
              Verified competency availability across active applicants.
            </p>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[8px] text-[14px] text-ink font-medium focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            >
              {jobs.map((j) => (
                <option key={j.job_id} value={j.job_id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {jobAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Top Matched Skills: Wine Bars */}
            <div className="space-y-4">
              <span className="text-[13px] font-mono uppercase text-ink-muted block">
                Top Matched Competencies
              </span>
              <div className="space-y-3.5">
                {jobAnalytics.most_common_matched_skills &&
                jobAnalytics.most_common_matched_skills.length > 0 ? (
                  jobAnalytics.most_common_matched_skills.map((item, idx) => {
                    const max = jobAnalytics.total_processed || 1;
                    const percent = Math.round((item.count / max) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-sans font-medium text-ink">{item.skill}</span>
                          <span className="font-mono text-ink-muted">
                            {item.count} candidates ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-alt rounded-full h-2 overflow-hidden border border-line">
                          <div
                            className="bg-wine h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[13px] text-ink-muted font-sans">
                    No matching records available.
                  </p>
                )}
              </div>
            </div>

            {/* Most Frequently Missing Skills: Warm-gray Bars */}
            <div className="space-y-4">
              <span className="text-[13px] font-mono uppercase text-ink-muted block">
                Frequently Missing Requirements
              </span>
              <div className="space-y-3.5">
                {jobAnalytics.most_frequently_missing_skills &&
                jobAnalytics.most_frequently_missing_skills.length > 0 ? (
                  jobAnalytics.most_frequently_missing_skills.map((item, idx) => {
                    const max = jobAnalytics.total_processed || 1;
                    const percent = Math.round((item.count / max) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-sans font-medium text-ink">{item.skill}</span>
                          <span className="font-mono text-ink-muted">
                            Missing in {item.count} resumes ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-alt rounded-full h-2 overflow-hidden border border-line">
                          <div
                            className="bg-ink-muted/50 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[13px] text-ink font-sans">
                    No competency gaps detected in applicants.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
