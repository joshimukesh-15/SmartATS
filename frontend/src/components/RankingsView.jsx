import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  FileSpreadsheet,
  GitCompare,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { fetchJobs, fetchJobRankings, getExportCsvUrl } from '../api';

export default function RankingsView({
  selectedJobId,
  onViewCandidate,
  onCompareCandidates,
}) {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(selectedJobId || '');
  const [rankingsData, setRankingsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    fetchJobs().then((data) => {
      setJobs(data);
      if (!jobId && data.length > 0) {
        setJobId(data[0].job_id);
      }
    });
  }, []);

  useEffect(() => {
    if (jobId) {
      setLoading(true);
      setSelectedCandidates([]);
      fetchJobRankings(jobId)
        .then((data) => setRankingsData(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [jobId]);

  const toggleSelectCandidate = (appId) => {
    if (selectedCandidates.includes(appId)) {
      setSelectedCandidates(selectedCandidates.filter((id) => id !== appId));
    } else {
      if (selectedCandidates.length >= 5) {
        alert('Maximum of 5 candidates can be compared simultaneously.');
        return;
      }
      setSelectedCandidates([...selectedCandidates, appId]);
    }
  };

  const handleCompareClick = () => {
    if (selectedCandidates.length < 2) {
      alert('Select at least 2 candidates to initiate comparison.');
      return;
    }
    onCompareCandidates(jobId, selectedCandidates);
  };

  const candidates = rankingsData?.rankings || [];
  const filteredCandidates = candidates.filter((c) =>
    (c.candidate_name && c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.candidate_email && c.candidate_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.matched_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
            Screening Results
          </span>
          <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
            Candidate Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Ranked candidate recommendations with verified keyword coverage and contextual similarity.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedCandidates.length >= 2 && (
            <button
              onClick={handleCompareClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-[0.98]"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedCandidates.length})</span>
            </button>
          )}

          {jobId && (
            <a
              href={getExportCsvUrl(jobId)}
              download
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Control Bar: Job Selector & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl shadow-lg">
        
        {/* Job Dropdown */}
        <div className="md:col-span-1">
          <label htmlFor="job-filter" className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5">
            Target Job Opening
          </label>
          <select
            id="job-filter"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-blue-500 transition-colors"
          >
            {jobs.map((j) => (
              <option key={j.job_id} value={j.job_id}>
                {j.title} ({j.applications_count || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="md:col-span-2">
          <label htmlFor="candidate-search" className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5">
            Search Filter
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Search candidate name, email, or matched technical skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[35vh]">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <Award className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Evaluation Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            No candidates processed for this position yet. Upload documents to generate scores.
          </p>
        </div>
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="leaderboard-table-caption"
          className="table-wrapper bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <table className="w-full text-left border-collapse">
            <caption id="leaderboard-table-caption" className="sr-only">
              Candidate Leaderboard and Hybrid Match Scores
            </caption>
            <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
              <tr>
                <th scope="col" className="p-4 w-12 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="py-4 px-3 w-16 text-center">Rank</th>
                <th scope="col" className="py-4 px-3">Candidate</th>
                <th scope="col" className="py-4 px-3 text-center">Final Score</th>
                <th scope="col" className="py-4 px-3 text-center">Required Skills</th>
                <th scope="col" className="py-4 px-3 text-center">Context Match</th>
                <th scope="col" className="py-4 px-3">Skill Breakdown</th>
                <th scope="col" className="py-4 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidates.includes(cand.application_id);
                const isTop1 = cand.rank === 1;

                return (
                  <tr
                    key={cand.application_id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCandidate(cand.application_id)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-750 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Rank */}
                    <td className="py-4 px-3 text-center font-mono font-bold">
                      {isTop1 ? (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                          #1 TOP
                        </span>
                      ) : (
                        <span className="text-slate-400">#{cand.rank}</span>
                      )}
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="py-4 px-3">
                      <div className="font-bold text-white text-sm">
                        {cand.candidate_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {cand.candidate_email || 'No email registered'}
                      </div>
                    </td>

                    {/* Final Score */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="text-sm font-bold text-white">
                        {cand.final_score.toFixed(1)}%
                      </span>
                    </td>

                    {/* Keyword Score */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="font-semibold text-emerald-400">
                        {cand.keyword_score.toFixed(1)}%
                      </span>
                    </td>

                    {/* TF-IDF Similarity */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="font-semibold text-blue-400">
                        {cand.tfidf_score.toFixed(1)}%
                      </span>
                    </td>

                    {/* Skills Coverage */}
                    <td className="py-4 px-3 max-w-xs">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {cand.matched_skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            >
                              ✓ {skill}
                            </span>
                          ))}
                          {cand.matched_skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-mono text-slate-400 bg-slate-800">
                              +{cand.matched_skills.length - 3}
                            </span>
                          )}
                        </div>

                        {cand.missing_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {cand.missing_skills.slice(0, 2).map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                              >
                                ✕ {skill}
                              </span>
                            ))}
                            {cand.missing_skills.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-mono text-rose-400 bg-rose-500/10">
                                +{cand.missing_skills.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onViewCandidate(cand)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold transition active:scale-[0.98]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Explain</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
