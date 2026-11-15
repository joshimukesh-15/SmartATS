import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { fetchOverviewAnalytics, fetchJobs } from '../api';

export default function OverviewView({ setActiveTab, onSelectJobForRankings }) {
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOverviewAnalytics(), fetchJobs()])
      .then(([analyticsData, jobsData]) => {
        setAnalytics(analyticsData);
        setJobs(jobsData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-7 h-7 border-2 border-[#1A1915] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Active Positions',
      value: analytics?.total_jobs || 0,
      subtext: 'Open requirements',
    },
    {
      label: 'Screened Candidates',
      value: analytics?.total_candidates || 0,
      subtext: 'Parsed & indexed',
    },
    {
      label: 'Processed Resumes',
      value: analytics?.processed_resumes || 0,
      subtext: 'Completed screenings',
    },
    {
      label: 'Average Score',
      value: `${analytics?.average_score || 0}%`,
      subtext: 'Hybrid benchmark',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Inverted Hero Card (Claude signature near-black contrast moment) */}
      <div className="bg-[#181816] text-[#FAF8F5] border border-[#2E2C28] rounded-xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-wider font-mono text-[#D96B43]">
            <span>Empirical Candidate Evaluation</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#FAF8F5] leading-tight">
            Objective resume screening, explained by design.
          </h1>
          <p className="text-sm text-[#B8B2A7] leading-relaxed font-sans max-w-xl">
            SmartATS eliminates arbitrary AI hallucinations through a verifiable hybrid matching model: 60% deterministic required skill coverage combined with 40% TF-IDF lexical cosine similarity.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#CC5A36] hover:bg-[#B84F2E] text-white rounded-md text-xs font-semibold tracking-wide transition shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Resumes</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#262522] hover:bg-[#33312C] text-[#FAF8F5] border border-[#3D3A34] rounded-md text-xs font-semibold tracking-wide transition"
            >
              <span>Manage Job Openings</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B8B2A7]" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5DFD5] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between"
          >
            <span className="text-[11px] uppercase tracking-wider font-mono text-[#8A8477]">
              {kpi.label}
            </span>
            <div className="my-3">
              <div className="font-serif text-3xl sm:text-4xl text-[#1A1915]">
                {kpi.value}
              </div>
            </div>
            <div className="text-[11px] text-[#59554D] border-t border-[#F3EFEA] pt-2">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Editorial Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Distribution Breakdown */}
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-7 shadow-xs space-y-6 lg:col-span-1">
          <div className="border-b border-[#E5DFD5] pb-4">
            <div className="text-[11px] uppercase font-mono tracking-wider text-[#8A8477]">
              Screening Distribution
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1A1915] mt-1">
              Score Tiers
            </h2>
          </div>

          <div className="space-y-4">
            {analytics?.score_distribution &&
              Object.entries(analytics.score_distribution).map(([range, count]) => {
                const total = analytics.processed_resumes || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={range} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono font-medium text-[#1A1915]">{range}</span>
                      <span className="font-mono text-[#8A8477]">
                        {count} candidates ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F3EFEA] rounded-xs h-2 overflow-hidden border border-[#E5DFD5]">
                      <div
                        className="h-full bg-[#1A1915] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-2 text-xs text-[#59554D] bg-[#FAF8F5] p-4 rounded-lg border border-[#E5DFD5] leading-relaxed">
            <div className="font-mono text-[11px] uppercase text-[#8A8477] mb-1">
              Scoring Standard
            </div>
            Scores reflect weighted evaluation: 60% mandatory keyword matches and 40% TF-IDF cosine alignment against the job description.
          </div>
        </div>

        {/* Active Openings Editorial List */}
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-7 shadow-xs space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
            <div>
              <div className="text-[11px] uppercase font-mono tracking-wider text-[#8A8477]">
                Live Postings
              </div>
              <h2 className="font-serif text-xl font-bold text-[#1A1915] mt-1">
                Active Job Openings
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-semibold text-[#CC5A36] hover:text-[#B84F2E] inline-flex items-center space-x-1 transition"
            >
              <span>View Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E5DFD5]">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.job_id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-serif text-base font-bold text-[#1A1915] group-hover:text-[#CC5A36] transition">
                      {job.title}
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#D6CEBF] bg-[#F3EFEA] text-[#59554D]">
                      {job.applications_count || 0} applicants
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#FAF8F5] text-[#59554D] border border-[#E5DFD5]"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 5 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-[#8A8477] font-mono">
                        +{job.required_skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <button
                    onClick={() => onSelectJobForRankings(job.job_id)}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#1A1915] text-[#1A1915] hover:text-white border border-[#D6CEBF] rounded text-xs font-semibold transition shadow-2xs"
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#59554D] hover:text-[#1A1915] border border-[#E5DFD5] rounded text-xs font-medium transition"
                  >
                    Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
