/* eslint-disable */
import { useState, useEffect } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';
import { fetchJobs, fetchJobRankings, compareCandidates } from '../api';

export default function CompareView({ jobId: initialJobId, preselectedAppIds = [], setActiveTab }) {
  const [jobId, setJobId] = useState(initialJobId || '');
  const [allCandidates, setAllCandidates] = useState([]);
  const [selectedAppIds, setSelectedAppIds] = useState(preselectedAppIds);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs().then((data) => {
      if (!jobId && data.length > 0) {
        setJobId(data[0].job_id);
      }
    });
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJobRankings(jobId).then((data) => {
        const cands = data?.rankings || [];
        setAllCandidates(cands);
        if (selectedAppIds.length < 2 && cands.length >= 2) {
          setSelectedAppIds([cands[0].application_id, cands[1].application_id]);
        }
      });
    }
  }, [jobId, selectedAppIds.length]);

  useEffect(() => {
    if (jobId && selectedAppIds.length >= 2) {
      let isMounted = true;
      setLoading(true);
      compareCandidates(jobId, selectedAppIds)
        .then((data) => {
          if (isMounted) setComparisonResult(data);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    } else {
      setComparisonResult(null);
    }
  }, [jobId, selectedAppIds]);

  const toggleCandidateSelection = (appId) => {
    if (selectedAppIds.includes(appId)) {
      if (selectedAppIds.length <= 2) {
        alert('Keep at least 2 candidates selected for comparison.');
        return;
      }
      setSelectedAppIds(selectedAppIds.filter((id) => id !== appId));
    } else {
      if (selectedAppIds.length >= 5) {
        alert('Maximum of 5 candidates can be compared simultaneously.');
        return;
      }
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  // Identify highest scoring candidate as winner
  const winnerCandidateId =
    comparisonResult?.candidates && comparisonResult.candidates.length > 0
      ? [...comparisonResult.candidates].sort((a, b) => b.final_score - a.final_score)[0]
          ?.application_id
      : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header: Serif H1 (36-40px) + One Muted Sentence + Action Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-ink tracking-tight leading-none">
            Differential Candidate Matrix
          </h1>
          <p className="text-[15px] text-ink-muted mt-2 font-sans">
            Side-by-side technical skill evaluation and evidence alignment across finalists.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('rankings')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-surface hover:bg-surface-alt text-ink border border-line rounded-[8px] text-[14px] font-medium transition-colors shadow-xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Candidate Selector Bar */}
      <div className="quiet-card bg-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-sans font-medium text-ink-muted">
            Select Applicants to Compare (2–5)
          </span>
          <span className="font-mono text-[13px] text-ink">
            {selectedAppIds.length} profiles active
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allCandidates.map((c) => {
            const isSelected = selectedAppIds.includes(c.application_id);
            return (
              <button
                key={c.application_id}
                onClick={() => toggleCandidateSelection(c.application_id)}
                className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-sans transition-colors flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-wine text-white shadow-xs'
                    : 'bg-canvas border border-line text-ink hover:bg-surface-alt'
                }`}
              >
                <span>{c.candidate_name}</span>
                <span className="font-mono text-[13px] opacity-80">
                  {c.final_score.toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="quiet-card bg-surface p-12 text-center">
          <div className="w-6 h-6 border-2 border-wine border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : !comparisonResult ? (
        <div className="quiet-card bg-surface p-12 text-center text-ink-muted text-[14px] font-sans">
          Select at least 2 candidates to generate side-by-side comparison.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {comparisonResult.candidates.map((c) => {
              const isWinner = c.application_id === winnerCandidateId;
              return (
                <div
                  key={c.application_id}
                  className={`quiet-card p-5 space-y-4 ${
                    isWinner ? 'bg-wine-soft/40 border-wine/40' : 'bg-surface'
                  }`}
                >
                  {isWinner && (
                    <span className="text-[13px] font-mono font-medium text-wine uppercase tracking-wider block">
                      Leading Match
                    </span>
                  )}

                  <div className="border-b border-line pb-3">
                    <h3 className="text-lg font-serif text-ink font-normal truncate">
                      {c.candidate_name}
                    </h3>
                    <div className="text-3xl font-mono font-semibold text-ink mt-1">
                      {c.final_score.toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[13px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Keywords:</span>
                      <span className="font-semibold text-ink">{c.keyword_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Context:</span>
                      <span className="font-semibold text-ink-muted">
                        {c.tfidf_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Total Skills:</span>
                      <span className="font-semibold text-ink">{c.total_extracted_skills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Missing Req:</span>
                      <span
                        className={`font-semibold ${c.missing_skills.length === 0 ? 'text-wine' : 'text-ink-muted'}`}
                      >
                        {c.missing_skills.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Common Skills Highlight Box */}
          {comparisonResult.common_matched_skills &&
            comparisonResult.common_matched_skills.length > 0 && (
              <div className="quiet-card bg-surface p-5 space-y-2">
                <span className="text-[13px] font-sans font-medium text-ink-muted block">
                  Shared Technical Competencies (Possessed by all selected candidates)
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {comparisonResult.common_matched_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-[6px] text-[13px] bg-surface-alt text-ink font-sans"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Full Side-by-Side Skill Matrix Table */}
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-ink font-normal tracking-tight">
              Competency Alignment Matrix
            </h2>
            <div className="quiet-card bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-surface-alt/40 text-[13px] font-mono text-ink-muted">
                      <th scope="col" className="p-4 font-normal">
                        Skill Requirement
                      </th>
                      <th scope="col" className="p-4 w-28 text-center font-normal">
                        Standard
                      </th>
                      {comparisonResult.candidates.map((c) => {
                        const isWinner = c.application_id === winnerCandidateId;
                        return (
                          <th
                            key={c.application_id}
                            scope="col"
                            className={`p-4 text-center font-normal font-serif text-[16px] ${
                              isWinner ? 'bg-wine-soft/40 text-wine font-medium' : 'text-ink'
                            }`}
                          >
                            <span>{c.candidate_name}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-[14px]">
                    {Object.entries(comparisonResult.skill_matrix).map(([skill, presenceMap]) => {
                      const isRequired = comparisonResult.required_skills.some(
                        (r) => r.toLowerCase() === skill.toLowerCase()
                      );

                      return (
                        <tr key={skill} className="hover:bg-surface-alt/40 transition-colors">
                          <td className="p-4 font-sans font-medium text-ink">{skill}</td>
                          <td className="p-4 text-center font-mono">
                            {isRequired ? (
                              <span className="px-2 py-0.5 rounded-[6px] text-[13px] bg-wine-soft text-wine font-medium">
                                REQUIRED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-[6px] text-[13px] bg-surface-alt text-ink-muted">
                                PREFERRED
                              </span>
                            )}
                          </td>
                          {comparisonResult.candidates.map((c) => {
                            const hasSkill = presenceMap[c.candidate_name];
                            const isWinner = c.application_id === winnerCandidateId;
                            return (
                              <td
                                key={c.application_id}
                                className={`p-4 text-center ${isWinner ? 'bg-wine-soft/20' : ''}`}
                              >
                                {hasSkill ? (
                                  <span className="inline-flex items-center justify-center text-wine">
                                    <Check className="w-4 h-4" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center text-ink-muted/30">
                                    <X className="w-4 h-4" />
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
