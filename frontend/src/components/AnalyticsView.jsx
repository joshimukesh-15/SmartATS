import React, { useState, useEffect } from 'react';
import {
  FileText,
  CopyCheck,
  Award,
  Users,
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
        <div className="w-8 h-8 border-2 border-[#7B1E3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-[#E8DDD0] pb-6">
        <span className="text-xs uppercase font-mono tracking-[0.12em] text-[#B8893B] font-semibold">
          Empirical Diagnostics
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1015] mt-1 tracking-tight">
          Screening Analytics & Intelligence
        </h1>
        <p className="text-sm text-[#6B5A55] mt-1 font-sans">
          Aggregate evaluation benchmarks, skill availability trends, and deficiency diagnostics.
        </p>
      </div>

      {/* Global Metrics Bar - 4 Identical Luxury Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Processed Documents */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-xs hover:border-[#B8893B]/40 transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
              Processed Docs
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
              <FileText className="w-5 h-5 text-[#B8893B]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2A1015]">
              {overview?.processed_resumes || 0}
            </div>
            <div className="text-xs text-[#8A6420] mt-1 font-mono font-medium">
              Screened successfully
            </div>
          </div>
        </div>

        {/* Card 2: Blocked Duplicates */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-xs hover:border-[#B8893B]/40 transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
              Blocked Duplicates
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
              <CopyCheck className="w-5 h-5 text-[#B8893B]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2A1015]">
              {overview?.duplicate_resumes || 0}
            </div>
            <div className="text-xs text-[#6B5A55] mt-1 font-mono">
              Via SHA-256 binary hash
            </div>
          </div>
        </div>

        {/* Card 3: Benchmark Average */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-xs hover:border-[#B8893B]/40 transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
              Benchmark Average
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
              <Award className="w-5 h-5 text-[#B8893B]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2A1015]">
              {overview?.average_score || 0}%
            </div>
            <div className="text-xs text-[#6B5A55] mt-1 font-mono">
              Platform-wide mean
            </div>
          </div>
        </div>

        {/* Card 4: Candidate Records */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-xs hover:border-[#B8893B]/40 transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
              Candidate Records
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
              <Users className="w-5 h-5 text-[#B8893B]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2A1015]">
              {overview?.total_candidates || 0}
            </div>
            <div className="text-xs text-[#6B5A55] mt-1 font-mono">
              Unique indexed profiles
            </div>
          </div>
        </div>

      </div>

      {/* Job-Specific Analytics Filter */}
      <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDD0] pb-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-[0.12em] text-[#B8893B] font-semibold">
              Role Analysis
            </span>
            <h2 className="text-xl font-serif font-bold text-[#2A1015] mt-0.5 tracking-tight">
              Skill Frequency & Gap Diagnostics
            </h2>
          </div>
          <div className="min-w-[240px]">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FBF7F2] border border-[#E8DDD0] rounded-xl text-sm text-[#2A1015] font-medium focus:outline-none focus:border-[#7B1E3A] transition-colors shadow-xs"
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
            
            {/* Top Matched Skills - Wine Progress Bars */}
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#8A6420] tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#B8893B]" />
                <span>TOP MATCHED SKILLS IN TALENT POOL</span>
              </div>
              <div className="space-y-3.5">
                {jobAnalytics.most_common_matched_skills && jobAnalytics.most_common_matched_skills.length > 0 ? (
                  jobAnalytics.most_common_matched_skills.map((item, idx) => {
                    const max = jobAnalytics.total_processed || 1;
                    const percent = Math.round((item.count / max) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-[#2A1015]">{item.skill}</span>
                          <span className="font-mono text-[#6B5A55]">
                            {item.count} candidates ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F5EEE6] rounded-full h-2.5 overflow-hidden border border-[#E8DDD0]">
                          <div
                            className="bg-[#7B1E3A] h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#6B5A55] font-mono">No matching records available.</p>
                )}
              </div>
            </div>

            {/* Most Frequently Missing Skills - Warm Gray Progress Bars at Lower Opacity */}
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#6B5A55] tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#6B5A55]" />
                <span>FREQUENTLY MISSING SKILLS (GAP DIAGNOSTICS)</span>
              </div>
              <div className="space-y-3.5">
                {jobAnalytics.most_frequently_missing_skills && jobAnalytics.most_frequently_missing_skills.length > 0 ? (
                  jobAnalytics.most_frequently_missing_skills.map((item, idx) => {
                    const max = jobAnalytics.total_processed || 1;
                    const percent = Math.round((item.count / max) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-[#2A1015]">{item.skill}</span>
                          <span className="font-mono text-[#6B5A55]">
                            Missing in {item.count} resumes ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#F5EEE6] rounded-full h-2.5 overflow-hidden border border-[#E8DDD0]">
                          <div
                            className="bg-[#6B5A55] opacity-60 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#8A6420] font-mono">No competency gaps detected in applicants.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
