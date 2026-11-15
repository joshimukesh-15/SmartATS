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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DFD5] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#8A8477]">
            Screening Results
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1915] mt-1">
            Candidate Leaderboard
          </h1>
          <p className="text-xs text-[#59554D] mt-1 font-sans">
            Ranked candidate recommendations with transparent keyword coverage and TF-IDF similarity.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedCandidates.length >= 2 && (
            <button
              onClick={handleCompareClick}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#1A1915] hover:bg-[#2B2A27] text-white rounded text-xs font-semibold tracking-wide transition shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedCandidates.length})</span>
            </button>
          )}

          {jobId && (
            <a
              href={getExportCsvUrl(jobId)}
              download
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#1A1915] border border-[#D6CEBF] rounded text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E7E4E]" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Control Bar: Job Selector & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-[#E5DFD5] p-4 rounded-xl shadow-xs">
        
        {/* Job Dropdown */}
        <div className="md:col-span-1">
          <label htmlFor="job-filter" className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-[#8A8477] mb-1">
            Target Job Opening
          </label>
          <select
            id="job-filter"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded text-xs text-[#1A1915] font-semibold focus:outline-none focus:border-[#1A1915]"
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
          <label htmlFor="candidate-search" className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-[#8A8477] mb-1">
            Search Filter
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8A8477]" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Search candidate name, email, or matched technical skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded text-xs text-[#1A1915] placeholder-[#8A8477] focus:outline-none focus:border-[#1A1915]"
            />
          </div>
        </div>

      </div>

      {/* Table Section (Modern Web Guidance Compliant) */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[35vh]">
          <div className="w-7 h-7 border-2 border-[#1A1915] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-12 text-center space-y-2">
          <Award className="w-8 h-8 text-[#8A8477] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#1A1915]">No Evaluation Records</h3>
          <p className="text-xs text-[#8A8477] max-w-sm mx-auto font-sans">
            No candidates processed for this position yet. Upload documents to generate scores.
          </p>
        </div>
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="leaderboard-table-caption"
          className="table-wrapper bg-white border border-[#E5DFD5] rounded-xl shadow-xs"
        >
          <table className="w-full text-left border-collapse">
            <caption id="leaderboard-table-caption" className="sr-only">
              Candidate Leaderboard and Hybrid Match Scores
            </caption>
            <thead className="bg-[#FAF8F5] sticky top-0 z-10 border-b border-[#E5DFD5] text-[10px] uppercase font-mono tracking-wider text-[#8A8477] font-semibold">
              <tr>
                <th scope="col" className="p-4 w-12 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="py-4 px-3 w-16 text-center">Rank</th>
                <th scope="col" className="py-4 px-3">Candidate</th>
                <th scope="col" className="py-4 px-3 text-center">Final Score</th>
                <th scope="col" className="py-4 px-3 text-center">Keyword (60%)</th>
                <th scope="col" className="py-4 px-3 text-center">TF-IDF (40%)</th>
                <th scope="col" className="py-4 px-3">Skill Breakdown</th>
                <th scope="col" className="py-4 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5] text-xs">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidates.includes(cand.application_id);
                const isTop1 = cand.rank === 1;

                return (
                  <tr
                    key={cand.application_id}
                    className={`hover:bg-[#FAF8F5] transition ${
                      isSelected ? 'bg-[#F8E8DF]/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCandidate(cand.application_id)}
                        className="w-3.5 h-3.5 rounded border-[#D6CEBF] text-[#1A1915] focus:ring-[#1A1915] cursor-pointer"
                      />
                    </td>

                    {/* Rank */}
                    <td className="py-4 px-3 text-center font-mono font-bold">
                      {isTop1 ? (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#1A1915] text-[#FAF8F5] text-[10px]">
                          #1 TOP
                        </span>
                      ) : (
                        <span className="text-[#8A8477]">#{cand.rank}</span>
                      )}
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="py-4 px-3">
                      <div className="font-serif font-bold text-[#1A1915] text-sm">
                        {cand.candidate_name}
                      </div>
                      <div className="text-[11px] text-[#8A8477] font-mono mt-0.5">
                        {cand.candidate_email || 'No email registered'}
                      </div>
                    </td>

                    {/* Final Score */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="text-sm font-bold text-[#1A1915]">
                        {cand.final_score.toFixed(1)}%
                      </span>
                    </td>

                    {/* Keyword Score */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="font-semibold text-[#1E7E4E]">
                        {cand.keyword_score.toFixed(1)}%
                      </span>
                    </td>

                    {/* TF-IDF Similarity */}
                    <td className="py-4 px-3 text-center font-mono">
                      <span className="font-semibold text-[#59554D]">
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
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EFFBF4] text-[#1E7E4E] border border-[#C2ECD4]"
                            >
                              ✓ {skill}
                            </span>
                          ))}
                          {cand.matched_skills.length > 3 && (
                            <span className="px-1 py-0.5 rounded text-[10px] font-mono text-[#8A8477] bg-[#FAF8F5]">
                              +{cand.matched_skills.length - 3}
                            </span>
                          )}
                        </div>

                        {cand.missing_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {cand.missing_skills.slice(0, 2).map((skill, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FDF1F0] text-[#B9382C] border border-[#F5CBC8]"
                              >
                                ✕ {skill}
                              </span>
                            ))}
                            {cand.missing_skills.length > 2 && (
                              <span className="px-1 py-0.5 rounded text-[10px] font-mono text-[#B9382C] bg-[#FDF1F0]">
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
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#1A1915] text-[#1A1915] hover:text-white border border-[#D6CEBF] rounded text-xs font-semibold transition"
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
