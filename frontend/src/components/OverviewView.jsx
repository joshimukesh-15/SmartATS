import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  Check,
  TrendingUp,
  Award,
  ArrowRight,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { fetchOverviewAnalytics, fetchJobs, fetchJobRankings } from '../api';

export default function OverviewView({ setActiveTab, onSelectJobForRankings }) {
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOverviewAnalytics(), fetchJobs()])
      .then(async ([analyticsData, jobsData]) => {
        setAnalytics(analyticsData);
        setJobs(jobsData);
        if (jobsData.length > 0) {
          try {
            const rankings = await fetchJobRankings(jobsData[0].job_id);
            if (rankings?.rankings) {
              setTopCandidates(rankings.rankings.slice(0, 2));
            }
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#7B1E3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // All stat cards identical: gold icon + number + label
  const kpis = [
    {
      label: 'Active Positions',
      value: analytics?.total_jobs || 0,
      subtext: 'Open requirements',
      icon: Briefcase,
    },
    {
      label: 'Screened Candidates',
      value: analytics?.total_candidates || 0,
      subtext: 'Parsed & indexed profiles',
      icon: Users,
    },
    {
      label: 'Processed Resumes',
      value: analytics?.processed_resumes || 0,
      subtext: 'Completed screenings',
      icon: FileText,
    },
    {
      label: 'Average Score',
      value: `${analytics?.average_score || 0}%`,
      subtext: 'System-wide mean benchmark',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Studio Banner with Mini Leaderboard Preview on Right Side */}
      <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_1px_2px_rgba(42,16,21,0.05)] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.12em] text-[#B8893B] bg-[#F7EDD8] px-3.5 py-1 rounded-full border border-[#B8893B]/30 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8893B]"></span>
              <span>Empirical Candidate Evaluation</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2A1015] leading-tight">
              Objective resume screening, explained by design.
            </h1>
            
            <p className="text-sm text-[#6B5A55] leading-relaxed font-sans max-w-xl">
              SmartATS eliminates arbitrary AI hallucinations through a verifiable screening model: deterministic required skill verification combined with contextual experience analysis.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#7B1E3A] hover:bg-[#5E1229] active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-white" />
                <span>Ingest Resumes</span>
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-transparent hover:bg-[#F8ECEF] active:scale-[0.98] text-[#7B1E3A] border border-[#7B1E3A] rounded-full text-xs font-semibold tracking-wide transition shadow-xs"
              >
                <span>Manage Job Openings</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#79736B]" />
              </button>
            </div>
          </div>

          {/* Right Hero Column: Mini Leaderboard Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#FBF7F2] border border-[#E8DDD0] rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#B8893B]">
              <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-2.5">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#B8893B]" />
                  <span className="font-serif text-xs font-bold text-[#2A1015]">Top Candidate Shortlist</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A6420] uppercase font-semibold bg-[#F7EDD8] px-2 py-0.5 rounded-full border border-[#B8893B]/20">
                  Live Preview
                </span>
              </div>

              {topCandidates.length > 0 ? (
                <div className="space-y-2.5">
                  {topCandidates.map((cand, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#E8DDD0] rounded-xl p-3 flex items-center justify-between space-x-3 shadow-xs hover:border-[#B8893B] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-xs text-[#2A1015] truncate">
                            {cand.candidate_name}
                          </span>
                          {cand.rank === 1 && (
                            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30">
                              TOP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-[10px] text-[#6B5A55] font-mono truncate">
                          <span>{cand.matched_skills.slice(0, 3).join(', ')}</span>
                          {cand.matched_skills.length > 3 && <span>+{cand.matched_skills.length - 3}</span>}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          cand.final_score >= 80
                            ? 'bg-[#7B1E3A] text-white'
                            : cand.final_score >= 60
                            ? 'bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30'
                            : 'bg-[#EFE7E1] text-[#6B5A55]'
                        }`}>
                          {cand.final_score.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveTab('rankings')}
                    className="w-full text-center text-xs font-semibold text-[#7B1E3A] hover:underline pt-1 block"
                  >
                    Open Full Leaderboard &rarr;
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#6B5A55] font-mono">
                  Select a job opening or upload resumes to populate leaderboard.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats Grid: ALL IDENTICAL (Gold icon in gold-soft container + number + label) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-[#E8DDD0] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(42,16,21,0.05)] hover:shadow-[0_8px_24px_rgba(123,30,58,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.12em] font-mono text-[#6B5A55] font-semibold">
                  {kpi.label}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
                  <Icon className="w-4 h-4 text-[#B8893B]" />
                </div>
              </div>
              
              <div className="my-1">
                <div className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2A1015]">
                  {kpi.value}
                </div>
              </div>

              <div className="text-xs text-[#6B5A55] border-t border-[#E8DDD0]/50 pt-2 mt-2">
                {kpi.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Section: Score Tiers Chart & Active Job Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Tiers Visual Chart */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(42,16,21,0.05)] space-y-6 lg:col-span-1">
          <div className="border-b border-[#E8DDD0] pb-4">
            <span className="eyebrow-label block">
              Screening Distribution
            </span>
            <h2 className="font-serif text-xl font-bold text-[#2A1015] mt-1">
              Score Tiers Breakdown
            </h2>
          </div>

          <div className="space-y-4">
            {analytics?.score_distribution &&
              Object.entries(analytics.score_distribution).map(([range, count]) => {
                const total = analytics.processed_resumes || 1;
                const percentage = Math.round((count / total) * 100);

                // Tier colors: 80-100% wine (#7B1E3A), 60-79% gold (#B8893B), <60% warm-gray (#6B5A55)
                const isHigh = range.includes('80') || range.includes('90');
                const isMid = range.includes('60') || range.includes('70');

                const barColor = isHigh ? 'bg-[#7B1E3A]' : isMid ? 'bg-[#B8893B]' : 'bg-[#6B5A55]';
                const tagBg = isHigh ? 'bg-[#F8ECEF] text-[#7B1E3A]' : isMid ? 'bg-[#F7EDD8] text-[#8A6420]' : 'bg-[#EFE7E1] text-[#6B5A55]';

                return (
                  <div key={range} className="space-y-1.5">
                    <div className="flex justify-between text-xs items-center">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${tagBg}`}>
                        {range}
                      </span>
                      <span className="font-mono text-[#6B5A55]">
                        {count} candidates ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F5EEE6] rounded-full h-2.5 overflow-hidden border border-[#E8DDD0]">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Tier Legend */}
          <div className="pt-2 text-xs text-[#6B5A55] bg-[#FBF7F2] p-4 rounded-xl border border-[#E8DDD0] space-y-2">
            <span className="eyebrow-label block text-[10px]">Tier Standards</span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7B1E3A]"></span>
              <span><strong>80–100%:</strong> Recommended Shortlist</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8893B]"></span>
              <span><strong>60–79%:</strong> Technical Validation Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B5A55]"></span>
              <span><strong>&lt;60%:</strong> Significant Gap Identified</span>
            </div>
          </div>
        </div>

        {/* Active Openings List */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(42,16,21,0.05)] space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-4">
            <div>
              <span className="eyebrow-label block">
                Live Postings
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2A1015] mt-1">
                Active Job Openings
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-semibold text-[#7B1E3A] hover:underline inline-flex items-center space-x-1 transition"
            >
              <span>View Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E8DDD0]">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.job_id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-serif text-base font-bold text-[#2A1015] group-hover:text-[#7B1E3A] transition">
                      {job.title}
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#E8DDD0] bg-[#F5EEE6] text-[#6B5A55]">
                      {job.applications_count || 0} applicants
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 5 && (
                      <span className="px-1.5 py-0.5 text-xs text-[#6B5A55] font-mono">
                        +{job.required_skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <button
                    onClick={() => onSelectJobForRankings(job.job_id)}
                    className="px-4 py-2 bg-transparent hover:bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A] rounded-full text-xs font-semibold transition active:scale-[0.98] shadow-xs"
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-3.5 py-2 bg-white hover:bg-[#F5EEE6] text-[#2A1015] border border-[#E8DDD0] rounded-full text-xs font-medium transition active:scale-[0.98] shadow-xs"
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
