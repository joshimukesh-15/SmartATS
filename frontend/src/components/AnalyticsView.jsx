import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
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
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchJobAnalytics(selectedJob)
        .then((data) => setJobAnalytics(data))
        .catch((err) => console.error(err));
    }
  }, [selectedJob]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
          Empirical Diagnostics
        </span>
        <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
          Screening Analytics & Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Aggregate evaluation benchmarks, skill availability trends, and deficiency diagnostics.
        </p>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
            Processed Documents
          </span>
          <div className="text-3xl font-bold text-white mt-1">
            {overview?.processed_resumes || 0}
          </div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">
            Screened successfully
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
            Blocked Duplicates
          </span>
          <div className="text-3xl font-bold text-amber-400 mt-1">
            {overview?.duplicate_resumes || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Via SHA-256 binary hash
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
            Benchmark Average
          </span>
          <div className="text-3xl font-bold text-blue-400 mt-1">
            {overview?.average_score || 0}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Platform-wide mean
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
            Candidate Records
          </span>
          <div className="text-3xl font-bold text-white mt-1">
            {overview?.total_candidates || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Unique indexed profiles
          </div>
        </div>
      </div>

      {/* Job-Specific Analytics Filter */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
              Role Analysis
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5 tracking-tight">
              Skill Frequency & Gap Diagnostics
            </h2>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-blue-500 transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Matched Skills */}
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>TOP MATCHED SKILLS IN TALENT POOL</span>
              </div>
              <div className="space-y-3">
                {jobAnalytics.most_common_matched_skills && jobAnalytics.most_common_matched_skills.length > 0 ? (
                  jobAnalytics.most_common_matched_skills.map((item, idx) => {
                    const max = jobAnalytics.total_processed || 1;
                    const percent = Math.round((item.count / max) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-white">{item.skill}</span>
                          <span className="font-mono text-slate-400">
                            {item.count} candidates ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 font-mono">No matching records available.</p>
                )}
              </div>
            </div>

            {/* Most Frequently Missing Skills */}
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>FREQUENTLY MISSING SKILLS (GAP DIAGNOSTICS)</span>
              </div>
              <div className="space-y-3">
                {jobAnalytics.most_frequently_missing_skills && jobAnalytics.most_frequently_missing_skills.length > 0 ? (
                  jobAnalytics.most_frequently_missing_skills.map((item, idx) => {
                    const max = jobAnalytics.total_processed || 1;
                    const percent = Math.round((item.count / max) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-white">{item.skill}</span>
                          <span className="font-mono text-rose-400">
                            Missing in {item.count} resumes ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-emerald-400 font-mono">No competency gaps detected in applicants.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
