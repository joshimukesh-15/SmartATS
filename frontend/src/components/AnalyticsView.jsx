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
        <div className="w-8 h-8 border-2 border-[#191716] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-[#E6E1D7] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-wider text-[#79736B] font-semibold">
          Empirical Diagnostics
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#191716] mt-1 tracking-tight">
          Screening Analytics & Intelligence
        </h1>
        <p className="text-xs text-[#4A4641] mt-1 font-sans">
          Aggregate evaluation benchmarks, skill availability trends, and deficiency diagnostics.
        </p>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E6E1D7] rounded-2xl p-5 shadow-xs hover:border-[#D5CEBE] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#79736B]">
            Processed Documents
          </span>
          <div className="text-3xl font-serif font-bold text-[#191716] mt-1">
            {overview?.processed_resumes || 0}
          </div>
          <div className="text-xs text-[#276749] mt-1 font-mono">
            Screened successfully
          </div>
        </div>

        <div className="bg-[#FEF8EE] border border-[#F9E3B4] rounded-2xl p-5 shadow-xs hover:border-[#D5CEBE] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#B45309]">
            Blocked Duplicates
          </span>
          <div className="text-3xl font-serif font-bold text-[#B45309] mt-1">
            {overview?.duplicate_resumes || 0}
          </div>
          <div className="text-xs text-[#79736B] mt-1 font-mono">
            Via SHA-256 binary hash
          </div>
        </div>

        <div className="bg-[#FAF0EB] border border-[#F0D5CA] rounded-2xl p-5 shadow-xs hover:border-[#D5CEBE] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#C96442]">
            Benchmark Average
          </span>
          <div className="text-3xl font-serif font-bold text-[#C96442] mt-1">
            {overview?.average_score || 0}%
          </div>
          <div className="text-xs text-[#79736B] mt-1 font-mono">
            Platform-wide mean
          </div>
        </div>

        <div className="bg-[#F0F6F2] border border-[#C8E3D4] rounded-2xl p-5 shadow-xs hover:border-[#D5CEBE] transition-all duration-300">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-[#276749]">
            Candidate Records
          </span>
          <div className="text-3xl font-serif font-bold text-[#276749] mt-1">
            {overview?.total_candidates || 0}
          </div>
          <div className="text-xs text-[#79736B] mt-1 font-mono">
            Unique indexed profiles
          </div>
        </div>
      </div>

      {/* Job-Specific Analytics Filter */}
      <div className="bg-white border border-[#E6E1D7] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D7] pb-4">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#79736B] font-semibold">
              Role Analysis
            </span>
            <h2 className="text-xl font-serif font-bold text-[#191716] mt-0.5 tracking-tight">
              Skill Frequency & Gap Diagnostics
            </h2>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F6F3ED] border border-[#E6E1D7] rounded-xl text-xs text-[#191716] font-medium focus:outline-none focus:border-[#C96442] transition-colors shadow-xs"
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
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#276749]">
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
                          <span className="font-semibold text-[#191716]">{item.skill}</span>
                          <span className="font-mono text-[#79736B]">
                            {item.count} candidates ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F6F3ED] rounded-full h-2 overflow-hidden border border-[#E6E1D7]">
                          <div
                            className="bg-[#276749] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#79736B] font-mono">No matching records available.</p>
                )}
              </div>
            </div>

            {/* Most Frequently Missing Skills */}
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#B93826]">
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
                          <span className="font-semibold text-[#191716]">{item.skill}</span>
                          <span className="font-mono text-[#B93826]">
                            Missing in {item.count} resumes ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F6F3ED] rounded-full h-2 overflow-hidden border border-[#E6E1D7]">
                          <div
                            className="bg-[#B93826] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#276749] font-mono">No competency gaps detected in applicants.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
