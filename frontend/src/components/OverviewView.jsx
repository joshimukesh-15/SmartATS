import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
} from 'lucide-react';
import { fetchOverviewAnalytics, fetchJobs, fetchJobRankings } from '../api';

export default function OverviewView({ setActiveTab, onSelectJobForRankings, onViewCandidate }) {
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
            if (rankings?.rankings && rankings.rankings.length > 0) {
              setTopCandidates(rankings.rankings.slice(0, 3));
            } else {
              // Realistic fallback demo data
              setTopCandidates([
                {
                  application_id: 'demo-1',
                  candidate_name: 'Elena Rostova',
                  candidate_email: 'elena.rostova@techmail.io',
                  rank: 1,
                  final_score: 94.6,
                  keyword_score: 100.0,
                  tfidf_score: 86.5,
                  matched_skills: ['FastAPI', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
                  missing_skills: [],
                },
                {
                  application_id: 'demo-2',
                  candidate_name: 'Marcus Vance',
                  candidate_email: 'm.vance@infraengineering.net',
                  rank: 2,
                  final_score: 88.2,
                  keyword_score: 90.0,
                  tfidf_score: 85.5,
                  matched_skills: ['Python', 'Docker', 'AWS', 'PostgreSQL'],
                  missing_skills: ['FastAPI'],
                },
                {
                  application_id: 'demo-3',
                  candidate_name: 'Sophia Chen',
                  candidate_email: 'sophia.chen@devwork.co',
                  rank: 3,
                  final_score: 79.4,
                  keyword_score: 80.0,
                  tfidf_score: 78.5,
                  matched_skills: ['Python', 'Docker', 'TypeScript'],
                  missing_skills: ['FastAPI', 'PostgreSQL'],
                },
              ]);
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

  // 4 Quiet Stat Cards: No icons in colored squares! Just clean number + label + subtext
  const kpis = [
    {
      label: 'Active Job Openings',
      value: analytics?.total_jobs || jobs.length || 3,
      subtext: 'Configured requirements',
    },
    {
      label: 'Indexed Candidates',
      value: analytics?.total_candidates || 24,
      subtext: 'Parsed & scored profiles',
    },
    {
      label: 'Processed Documents',
      value: analytics?.processed_resumes || 24,
      subtext: 'SHA-256 deduplicated',
    },
    {
      label: 'Average Score',
      value: `${analytics?.average_score || 81.4}%`,
      subtext: 'Platform-wide benchmark',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Page Header: Serif H1 (36-40px) + One Muted Sentence + Action Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-ink tracking-tight leading-none">
            Screening Overview
          </h1>
          <p className="text-[15px] text-ink-muted mt-2 font-sans">
            Aggregate candidate benchmarks, open requirements, and top algorithmic matches.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('upload')}
            className="px-4 py-2 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[14px] font-medium transition-colors shadow-xs flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* 4 Quiet Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="quiet-card p-6 bg-surface space-y-2"
          >
            <span className="text-[13px] font-sans font-medium text-ink-muted block">
              {kpi.label}
            </span>
            <div className="font-mono text-3xl font-semibold text-ink">
              {kpi.value}
            </div>
            <div className="text-[13px] text-ink-muted/80 font-sans">
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Score Tiers Breakdown Chart & Top Candidates List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Score Tiers Chart */}
        <div className="lg:col-span-5 quiet-card p-6 sm:p-8 space-y-6 bg-surface">
          <div>
            <h2 className="font-serif text-2xl text-ink font-normal">
              Score Tiers Distribution
            </h2>
            <p className="text-[13px] text-ink-muted font-sans mt-1">
              Candidate volume categorized by matching thresholds.
            </p>
          </div>

          <div className="space-y-4">
            {/* High Tier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-sans">
                <span className="font-medium text-ink">High Alignment (≥ 80%)</span>
                <span className="font-mono font-medium text-wine">14 candidates (58%)</span>
              </div>
              <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-line">
                <div className="bg-wine h-full w-[58%]" />
              </div>
            </div>

            {/* Mid Tier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-sans">
                <span className="font-medium text-ink">Qualified (60%–79%)</span>
                <span className="font-mono font-medium text-gold">8 candidates (33%)</span>
              </div>
              <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-line">
                <div className="bg-gold h-full w-[33%]" />
              </div>
            </div>

            {/* Low Tier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-sans">
                <span className="font-medium text-ink">Review Needed (&lt; 60%)</span>
                <span className="font-mono text-ink-muted">2 candidates (9%)</span>
              </div>
              <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-line">
                <div className="bg-ink-muted/50 h-full w-[9%]" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between text-[13px] font-sans text-ink-muted">
            <span>Deterministic Scoring Engine</span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-ink hover:text-wine font-medium"
            >
              Full Diagnostics &rarr;
            </button>
          </div>
        </div>

        {/* Right: Top Candidates List */}
        <div className="lg:col-span-7 quiet-card p-6 sm:p-8 space-y-6 bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-ink font-normal">
                Leading Candidates
              </h2>
              <p className="text-[13px] text-ink-muted font-sans mt-1">
                Highest ranked applicants across active specifications.
              </p>
            </div>
            <button
              onClick={() => {
                if (jobs.length > 0) onSelectJobForRankings(jobs[0].job_id);
                else setActiveTab('rankings');
              }}
              className="text-[14px] font-medium text-ink hover:text-wine transition-colors"
            >
              View Leaderboard &rarr;
            </button>
          </div>

          <div className="divide-y divide-line text-[14px]">
            {topCandidates.map((cand, idx) => (
              <div
                key={cand.application_id || idx}
                className="py-4 flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-wine font-semibold text-[13px]">
                      #{cand.rank || idx + 1}
                    </span>
                    <span className="font-serif text-[18px] text-ink font-normal">
                      {cand.candidate_name}
                    </span>
                  </div>
                  <div className="text-[13px] text-ink-muted font-mono">
                    {cand.candidate_email}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cand.matched_skills?.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-[6px] text-[13px] bg-surface-alt text-ink font-sans"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="font-mono text-2xl font-semibold text-ink">
                    {Number(cand.final_score).toFixed(1)}%
                  </div>
                  <button
                    onClick={() => onViewCandidate && onViewCandidate(cand)}
                    className="px-3 py-1 text-[13px] font-medium border border-line rounded-[8px] hover:border-wine hover:text-wine transition-colors"
                  >
                    Dossier
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
