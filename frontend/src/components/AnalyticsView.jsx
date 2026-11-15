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
        <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-wider text-[#059669] font-semibold">
          Empirical Diagnostics
        </span>
        <h1 className="text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
          Screening Analytics & Intelligence
        </h1>
        <p className="text-xs text-[#64748B] mt-1 font-sans">
          Aggregate evaluation benchmarks, skill availability trends, and deficiency diagnostics.
        </p>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs hover:border-[#CBD5E1] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#64748B]">
            Processed Documents
          </span>
          <div className="text-3xl font-bold text-[#0F172A] mt-1">
            {overview?.processed_resumes || 0}
          </div>
          <div className="text-xs text-[#065F46] mt-1 font-mono font-medium">
            Screened successfully
          </div>
        </div>

        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 shadow-xs hover:border-[#CBD5E1] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#92400E]">
            Blocked Duplicates
          </span>
          <div className="text-3xl font-bold text-[#92400E] mt-1">
            {overview?.duplicate_resumes || 0}
          </div>
          <div className="text-xs text-[#64748B] mt-1 font-mono">
            Via SHA-256 binary hash
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs hover:border-[#CBD5E1] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#64748B]">
            Benchmark Average
          </span>
          <div className="text-3xl font-bold text-[#0F172A] mt-1">
            {overview?.average_score || 0}%
          </div>
          <div className="text-xs text-[#64748B] mt-1 font-mono">
            Platform-wide mean
          </div>
        </div>

        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-5 shadow-xs hover:border-[#CBD5E1] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#065F46]">
            Candidate Records
          </span>
          <div className="text-3xl font-bold text-[#065F46] mt-1">
            {overview?.total_candidates || 0}
          </div>
          <div className="text-xs text-[#64748B] mt-1 font-mono">
            Unique indexed profiles
          </div>
        </div>
      </div>

      {/* Job-Specific Analytics Filter */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#64748B] font-semibold">
              Role Analysis
            </span>
            <h2 className="text-xl font-bold text-[#0F172A] mt-0.5 tracking-tight">
              Skill Frequency & Gap Diagnostics
            </h2>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#059669] transition-colors shadow-xs"
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
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#065F46]">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
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
                          <span className="font-semibold text-[#0F172A]">{item.skill}</span>
                          <span className="font-mono text-[#64748B]">
                            {item.count} candidates ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
                          <div
                            className="bg-[#059669] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#64748B] font-mono">No matching records available.</p>
                )}
              </div>
            </div>

            {/* Most Frequently Missing Skills */}
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#E11D48]">
                <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
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
                          <span className="font-semibold text-[#0F172A]">{item.skill}</span>
                          <span className="font-mono text-[#E11D48]">
                            Missing in {item.count} resumes ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
                          <div
                            className="bg-[#E11D48] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#065F46] font-mono">No competency gaps detected in applicants.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
