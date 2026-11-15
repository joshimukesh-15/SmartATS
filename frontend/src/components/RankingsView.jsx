import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  GitCompare,
  Search,
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
  }, [jobId]);

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
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header: Serif H1 (36-40px) + One Muted Sentence + Action Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-ink tracking-tight leading-none">
            Candidate Leaderboard
          </h1>
          <p className="text-[15px] text-ink-muted mt-2 font-sans">
            Ranked candidate recommendations with verified keyword coverage and normalized text similarity.
          </p>
        </div>

        {/* Primary Actions on Right */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedCandidates.length >= 2 && (
            <button
              onClick={handleCompareClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[14px] font-medium transition-colors shadow-xs"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Selected ({selectedCandidates.length})</span>
            </button>
          )}

          {jobId && (
            <a
              href={getExportCsvUrl(jobId)}
              download
              className="inline-flex items-center space-x-2 px-4 py-2 bg-surface hover:bg-surface-alt text-ink border border-line rounded-[8px] text-[14px] font-medium transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-ink-muted" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Control Bar: Job Selector & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface border border-line p-5 rounded-[16px] shadow-xs">
        
        {/* Job Dropdown */}
        <div className="md:col-span-1">
          <label htmlFor="job-filter" className="block text-[13px] font-sans font-medium text-ink-muted mb-1.5">
            Target Job Opening
          </label>
          <select
            id="job-filter"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink font-medium focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
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
          <label htmlFor="candidate-search" className="block text-[13px] font-sans font-medium text-ink-muted mb-1.5">
            Search Applicants
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-ink-muted" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Filter by candidate name, email, or technical skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            />
          </div>
        </div>

      </div>

      {/* Main Leaderboard Content */}
      {loading ? (
        <div className="quiet-card bg-surface overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-alt/50 rounded-[8px] animate-pulse flex items-center px-4 justify-between" />
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="quiet-card bg-surface p-12 text-center space-y-3">
          <h3 className="font-serif text-2xl text-ink font-normal">No Evaluation Records</h3>
          <p className="text-[14px] text-ink-muted max-w-sm mx-auto font-sans">
            No candidates processed for this position yet. Upload documents via the Ingestion tab to generate scores.
          </p>
        </div>
      ) : (
        <div className="quiet-card bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-alt/40 text-[13px] font-mono text-ink-muted">
                  <th scope="col" className="p-4 w-12 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th scope="col" className="py-4 px-3 w-16 text-center font-normal">Rank</th>
                  <th scope="col" className="py-4 px-3 font-normal">Candidate</th>
                  <th scope="col" className="py-4 px-3 text-center font-normal">Composite Score</th>
                  <th scope="col" className="py-4 px-3 text-center font-normal">Required Coverage</th>
                  <th scope="col" className="py-4 px-3 text-center font-normal">Similarity</th>
                  <th scope="col" className="py-4 px-3 font-normal">Verified Skills</th>
                  <th scope="col" className="py-4 px-4 text-right font-normal">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[14px]">
                {filteredCandidates.map((cand) => {
                  const isSelected = selectedCandidates.includes(cand.application_id);
                  const isTop1 = cand.rank === 1;

                  const isHigh = cand.final_score >= 80;
                  const isMid = cand.final_score >= 60 && cand.final_score < 80;

                  return (
                    <tr
                      key={cand.application_id}
                      className={`h-16 transition-colors ${
                        isTop1 ? 'bg-wine-soft/40 hover:bg-wine-soft/60' : 'hover:bg-surface-alt/50'
                      } ${isSelected ? 'ring-1 ring-inset ring-wine' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCandidate(cand.application_id)}
                          className="w-4 h-4 rounded-[4px] border-line text-wine focus:ring-gold cursor-pointer"
                        />
                      </td>

                      {/* Rank */}
                      <td className="py-4 px-3 text-center font-mono">
                        {isTop1 ? (
                          <span className="text-wine font-semibold text-[13px]">
                            #1
                          </span>
                        ) : (
                          <span className="text-ink-muted text-[13px]">#{cand.rank}</span>
                        )}
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-4 px-3">
                        <div className="font-serif text-ink text-[17px] font-normal">
                          {cand.candidate_name}
                        </div>
                        <div className="text-[13px] text-ink-muted font-mono mt-0.5">
                          {cand.candidate_email || 'No email specified'}
                        </div>
                      </td>

                      {/* Composite Score with Slim 4px Bar (No filled pill badges!) */}
                      <td className="py-4 px-3 text-center font-mono w-32">
                        <div className="space-y-1">
                          <div className={`text-[16px] font-semibold ${isTop1 ? 'text-wine' : 'text-ink'}`}>
                            {cand.final_score.toFixed(1)}%
                          </div>
                          <div className="w-20 mx-auto bg-line h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? 'bg-wine' : isMid ? 'bg-gold' : 'bg-ink-muted/50'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, cand.final_score))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Keyword Score */}
                      <td className="py-4 px-3 text-center font-mono text-[14px] text-ink">
                        {cand.keyword_score.toFixed(1)}%
                      </td>

                      {/* Context Similarity */}
                      <td className="py-4 px-3 text-center font-mono text-[14px] text-ink-muted">
                        {cand.tfidf_score.toFixed(1)}%
                      </td>

                      {/* Skill Breakdown (Smaller, 13px, quiet tags) */}
                      <td className="py-4 px-3 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {cand.matched_skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-[6px] text-[13px] font-sans bg-surface-alt text-ink"
                            >
                              {skill}
                            </span>
                          ))}
                          {cand.matched_skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-[6px] text-[13px] font-mono text-ink-muted bg-surface-alt">
                              +{cand.matched_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onViewCandidate(cand)}
                          className="px-3 py-1.5 rounded-[8px] border border-line text-ink hover:text-wine hover:border-wine text-[13px] font-medium transition-colors"
                        >
                          Explain
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
