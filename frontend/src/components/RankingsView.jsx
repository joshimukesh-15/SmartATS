import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  FileSpreadsheet,
  GitCompare,
  Eye,
  Check,
  X,
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8DDD0] pb-6">
        <div>
          <span className="eyebrow-label block">
            Screening Results
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A1015] mt-1 tracking-tight">
            Candidate Leaderboard
          </h1>
          <p className="text-xs text-[#6B5A55] mt-1 font-sans">
            Ranked candidate recommendations with verified keyword coverage and contextual similarity.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedCandidates.length >= 2 && (
            <button
              onClick={handleCompareClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#7B1E3A] hover:bg-[#5E1229] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-[0.98]"
            >
              <GitCompare className="w-3.5 h-3.5 text-white" />
              <span>Compare Selected ({selectedCandidates.length})</span>
            </button>
          )}

          {jobId && (
            <a
              href={getExportCsvUrl(jobId)}
              download
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A] rounded-full text-xs font-semibold transition active:scale-[0.98] shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#B8893B]" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Control Bar: Job Selector & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-[#E8DDD0] p-4 rounded-2xl shadow-[0_1px_2px_rgba(42,16,21,0.05)]">
        
        {/* Job Dropdown */}
        <div className="md:col-span-1">
          <label htmlFor="job-filter" className="block text-[11px] uppercase font-mono tracking-wider font-semibold text-[#6B5A55] mb-1.5">
            Target Job Opening
          </label>
          <select
            id="job-filter"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FBF7F2] border border-[#E8DDD0] rounded-xl text-xs text-[#2A1015] font-medium focus:outline-none focus:border-[#7B1E3A] transition-colors shadow-xs"
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
          <label htmlFor="candidate-search" className="block text-[11px] uppercase font-mono tracking-wider font-semibold text-[#6B5A55] mb-1.5">
            Search Filter
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#6B5A55]" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Search candidate name, email, or matched technical skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBF7F2] border border-[#E8DDD0] rounded-xl text-xs text-[#2A1015] placeholder-[#6B5A55]/60 focus:outline-none focus:border-[#7B1E3A] transition-colors shadow-xs"
            />
          </div>
        </div>

      </div>

      {/* Main Leaderboard Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[35vh]">
          <div className="w-8 h-8 border-2 border-[#7B1E3A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-12 text-center space-y-2">
          <Award className="w-8 h-8 text-[#B8893B] mx-auto opacity-70" />
          <h3 className="font-serif text-base font-bold text-[#2A1015]">No Evaluation Records</h3>
          <p className="text-xs text-[#6B5A55] max-w-sm mx-auto font-sans">
            No candidates processed for this position yet. Upload documents to generate scores.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Sticky header + Row Hover + Tier progress bars) */}
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="leaderboard-table-caption"
            className="hidden md:block table-wrapper bg-white border border-[#E8DDD0] rounded-2xl shadow-[0_1px_2px_rgba(42,16,21,0.05)] overflow-hidden"
          >
            <table className="w-full text-left border-collapse">
              <caption id="leaderboard-table-caption" className="sr-only">
                Candidate Leaderboard and Hybrid Match Scores
              </caption>
              <thead className="bg-[#FBF7F2] sticky top-0 z-10 border-b border-[#E8DDD0] text-[10px] uppercase font-mono tracking-[0.1em] text-[#6B5A55] font-semibold">
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
              <tbody className="divide-y divide-[#E8DDD0] text-xs">
                {filteredCandidates.map((cand) => {
                  const isSelected = selectedCandidates.includes(cand.application_id);
                  const isTop1 = cand.rank === 1;

                  const isHigh = cand.final_score >= 80;
                  const isMid = cand.final_score >= 60 && cand.final_score < 80;

                  return (
                    <tr
                      key={cand.application_id}
                      className={`transition-colors duration-150 ${
                        isTop1 ? 'bg-[#F8ECEF]/80 hover:bg-[#F8ECEF]' : 'hover:bg-[#F5EEE6]/70'
                      } ${isSelected ? 'ring-1 ring-inset ring-[#7B1E3A]' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCandidate(cand.application_id)}
                          className="w-4 h-4 rounded border-[#E8DDD0] text-[#7B1E3A] focus:ring-[#B8893B] cursor-pointer"
                        />
                      </td>

                      {/* Rank */}
                      <td className="py-4 px-3 text-center font-mono font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/40 text-[10px] font-bold shadow-xs">
                            #1 TOP
                          </span>
                        ) : (
                          <span className="text-[#6B5A55]">#{cand.rank}</span>
                        )}
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-4 px-3">
                        <div className="font-serif font-bold text-[#2A1015] text-sm">
                          {cand.candidate_name}
                        </div>
                        <div className="text-[11px] text-[#6B5A55] font-mono mt-0.5">
                          {cand.candidate_email || 'No email registered'}
                        </div>
                      </td>

                      {/* Final Score with Tier Badge + Thin Progress Bar */}
                      <td className="py-4 px-3 text-center font-mono w-32">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isHigh
                              ? 'bg-[#7B1E3A] text-white'
                              : isMid
                              ? 'bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30'
                              : 'bg-[#EFE7E1] text-[#6B5A55]'
                          }`}>
                            {cand.final_score.toFixed(1)}%
                          </span>
                          <div className="w-20 mx-auto bg-[#F5EEE6] rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? 'bg-[#7B1E3A]' : isMid ? 'bg-[#B8893B]' : 'bg-[#6B5A55]'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, cand.final_score))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Keyword Score */}
                      <td className="py-4 px-3 text-center font-mono">
                        <span className="font-semibold text-[#8A6420]">
                          {cand.keyword_score.toFixed(1)}%
                        </span>
                      </td>

                      {/* TF-IDF Similarity */}
                      <td className="py-4 px-3 text-center font-mono">
                        <span className="font-semibold text-[#6B5A55]">
                          {cand.tfidf_score.toFixed(1)}%
                        </span>
                      </td>

                      {/* Skills Coverage (Matched = gold-soft with check, Missing = warm-gray with dashed border & x) */}
                      <td className="py-4 px-3 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {cand.matched_skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30"
                              >
                                <Check className="w-2.5 h-2.5 text-[#B8893B]" />
                                <span>{skill}</span>
                              </span>
                            ))}
                            {cand.matched_skills.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono text-[#6B5A55] bg-[#F5EEE6] border border-[#E8DDD0]">
                                +{cand.matched_skills.length - 3}
                              </span>
                            )}
                          </div>

                          {cand.missing_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {cand.missing_skills.slice(0, 2).map((skill, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EFE7E1] text-[#6B5A55] border border-dashed border-[#6B5A55]/40"
                                >
                                  <X className="w-2.5 h-2.5 text-[#6B5A55]" />
                                  <span>{skill}</span>
                                </span>
                              ))}
                              {cand.missing_skills.length > 2 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono text-[#6B5A55] bg-[#EFE7E1] border border-dashed border-[#6B5A55]/40">
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
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A] rounded-full text-xs font-semibold transition active:scale-[0.98] shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#B8893B]" />
                          <span>Explain</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Responsive Table Collapse) */}
          <div className="md:hidden space-y-4">
            {filteredCandidates.map((cand) => {
              const isSelected = selectedCandidates.includes(cand.application_id);
              const isTop1 = cand.rank === 1;
              const isHigh = cand.final_score >= 80;
              const isMid = cand.final_score >= 60 && cand.final_score < 80;

              return (
                <div
                  key={cand.application_id}
                  className={`border rounded-2xl p-5 shadow-xs space-y-3.5 ${
                    isTop1 ? 'bg-[#F8ECEF]/80 border-[#7B1E3A]/40' : 'bg-white border-[#E8DDD0]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {isTop1 ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/40 text-[10px] font-bold">
                            #1 TOP
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-[#6B5A55]">#{cand.rank}</span>
                        )}
                        <h3 className="font-serif font-bold text-[#2A1015] text-base">{cand.candidate_name}</h3>
                      </div>
                      <p className="text-xs text-[#6B5A55] font-mono">{cand.candidate_email}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                      isHigh
                        ? 'bg-[#7B1E3A] text-white'
                        : isMid
                        ? 'bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30'
                        : 'bg-[#EFE7E1] text-[#6B5A55]'
                    }`}>
                      {cand.final_score.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#FBF7F2] p-2.5 rounded-xl border border-[#E8DDD0]">
                    <div>
                      <span className="text-[#6B5A55] text-[10px] block">Keywords:</span>
                      <span className="font-bold text-[#8A6420]">{cand.keyword_score.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[#6B5A55] text-[10px] block">Context:</span>
                      <span className="font-bold text-[#6B5A55]">{cand.tfidf_score.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {cand.matched_skills.map((s, i) => (
                        <span key={i} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30">
                          <Check className="w-2.5 h-2.5 text-[#B8893B]" />
                          <span>{s}</span>
                        </span>
                      ))}
                    </div>
                    {cand.missing_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cand.missing_skills.map((s, i) => (
                          <span key={i} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EFE7E1] text-[#6B5A55] border border-dashed border-[#6B5A55]/40">
                            <X className="w-2.5 h-2.5 text-[#6B5A55]" />
                            <span>{s}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DDD0]">
                    <label className="flex items-center space-x-2 text-xs font-medium text-[#6B5A55] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCandidate(cand.application_id)}
                        className="w-4 h-4 rounded border-[#E8DDD0] text-[#7B1E3A] focus:ring-[#B8893B]"
                      />
                      <span>Select to Compare</span>
                    </label>

                    <button
                      onClick={() => onViewCandidate(cand)}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A] rounded-full text-xs font-semibold"
                    >
                      Explain Details &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
