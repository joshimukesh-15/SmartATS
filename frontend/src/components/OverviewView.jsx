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
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Studio Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative">
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-medium text-slate-700 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Empirical Candidate Evaluation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Objective resume screening, explained by design.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-sans max-w-xl">
            SmartATS eliminates arbitrary AI hallucinations through a verifiable screening model: deterministic required skill verification combined with contextual experience analysis.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-black active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Resumes</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 hover:text-slate-900 border border-slate-200 rounded-full text-xs font-semibold tracking-wide transition"
            >
              <span>Manage Job Openings</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span className="text-xs uppercase tracking-wider font-mono text-slate-500">
              {kpi.label}
            </span>
            <div className="my-3">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {kpi.value}
              </div>
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-2">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Distribution Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 lg:col-span-1">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-500">
              Screening Distribution
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
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
                      <span className="font-mono font-medium text-slate-800">{range}</span>
                      <span className="font-mono text-slate-500">
                        {count} candidates ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
            <div className="font-mono text-[11px] uppercase text-slate-800 font-semibold mb-1">
              Scoring Standard
            </div>
            Scores reflect weighted evaluation: verified mandatory keyword matches and contextual cosine alignment against the job description.
          </div>
        </div>

        {/* Active Openings List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-slate-500">
                Live Postings
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Active Job Openings
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 inline-flex items-center space-x-1 transition"
            >
              <span>View Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.job_id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition">
                      {job.title}
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                      {job.applications_count || 0} applicants
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 5 && (
                      <span className="px-1.5 py-0.5 text-xs text-slate-500 font-mono">
                        +{job.required_skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <button
                    onClick={() => onSelectJobForRankings(job.job_id)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition active:scale-[0.98] shadow-xs"
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-medium transition active:scale-[0.98]"
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
