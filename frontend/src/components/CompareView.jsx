import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Crown,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { fetchJobs, fetchJobRankings, compareCandidates } from '../api';

export default function CompareView({
  jobId: initialJobId,
  preselectedAppIds = [],
  setActiveTab,
}) {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(initialJobId || '');
  const [allCandidates, setAllCandidates] = useState([]);
  const [selectedAppIds, setSelectedAppIds] = useState(preselectedAppIds);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      fetchJobRankings(jobId).then((data) => {
        const cands = data?.rankings || [];
        setAllCandidates(cands);
        if (selectedAppIds.length < 2 && cands.length >= 2) {
          setSelectedAppIds([cands[0].application_id, cands[1].application_id]);
        }
      });
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId && selectedAppIds.length >= 2) {
      setLoading(true);
      compareCandidates(jobId, selectedAppIds)
        .then((data) => setComparisonResult(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
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
  const winnerCandidateId = comparisonResult?.candidates && comparisonResult.candidates.length > 0
    ? [...comparisonResult.candidates].sort((a, b) => b.final_score - a.final_score)[0]?.application_id
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8DDD0] pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-[0.12em] text-[#B8893B] font-semibold">
            Differential Analysis
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1015] mt-1 tracking-tight">
            Candidate Comparison Matrix
          </h1>
          <p className="text-sm text-[#6B5A55] mt-1 font-sans">
            Side-by-side technical skill evaluation across multiple candidate profiles.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('rankings')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#F8ECEF] text-[#7B1E3A] rounded-full border border-[#7B1E3A]/40 text-xs font-semibold transition active:scale-[0.98] shadow-xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Candidate Selector Bar */}
      <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
            Selected for Comparison (2–5)
          </span>
          <span className="font-mono text-xs text-[#2A1015] font-semibold">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-[0.98] flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-[#7B1E3A] border-[#7B1E3A] text-white shadow-xs'
                    : 'bg-white border-[#E8DDD0] text-[#6B5A55] hover:text-[#2A1015] hover:border-[#7B1E3A]/40'
                }`}
              >
                <span>{c.candidate_name}</span>
                <span className="font-mono text-[10px] opacity-80">
                  {c.final_score.toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-2 border-[#7B1E3A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !comparisonResult ? (
        <div className="p-12 text-center text-[#6B5A55] text-xs font-mono">
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
                  className={`rounded-2xl p-5 shadow-xs space-y-4 transition-all duration-300 relative ${
                    isWinner
                      ? 'bg-[#F8ECEF] border-2 border-[#7B1E3A]/60 shadow-[0_8px_24px_rgba(123,30,58,0.12)]'
                      : 'bg-white border border-[#E8DDD0] hover:border-[#B8893B]/40'
                  }`}
                >
                  {isWinner && (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#F7EDD8] border border-[#B8893B]/30 text-[#8A6420] text-[10px] font-mono font-bold tracking-wider mb-1">
                      <Crown className="w-3.5 h-3.5 text-[#B8893B]" />
                      <span>TOP MATCH</span>
                    </div>
                  )}

                  <div className="border-b border-[#E8DDD0] pb-3">
                    <h3 className="text-base font-serif font-bold text-[#2A1015] truncate">
                      {c.candidate_name}
                    </h3>
                    <div className="text-2xl font-serif font-bold text-[#7B1E3A] mt-1">
                      {c.final_score.toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#6B5A55]">Keywords:</span>
                      <span className="font-semibold text-[#8A6420]">{c.keyword_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5A55]">Context:</span>
                      <span className="font-semibold text-[#7B1E3A]">{c.tfidf_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5A55]">Total Skills:</span>
                      <span className="font-semibold text-[#2A1015]">{c.total_extracted_skills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5A55]">Missing Req:</span>
                      <span className={`font-semibold ${c.missing_skills.length === 0 ? 'text-[#7B1E3A]' : 'text-[#6B5A55]'}`}>
                        {c.missing_skills.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Common Skills Highlight Box */}
          {comparisonResult.common_matched_skills && comparisonResult.common_matched_skills.length > 0 && (
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 space-y-2 shadow-xs">
              <span className="text-xs uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
                Shared Technical Competencies (Possessed by all selected candidates)
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {comparisonResult.common_matched_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Side-by-Side Skill Matrix Table */}
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#2A1015] tracking-tight">
              Competency Alignment Matrix
            </h2>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="comparison-matrix-caption"
              className="table-wrapper bg-white border border-[#E8DDD0] rounded-2xl shadow-xs overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <caption id="comparison-matrix-caption" className="sr-only">
                  Technical skill comparison matrix
                </caption>
                <thead className="bg-[#FBF7F2] sticky top-0 z-10 border-b border-[#E8DDD0] text-[10px] uppercase font-mono tracking-[0.12em] text-[#6B5A55] font-semibold">
                  <tr>
                    <th scope="col" className="p-4">Skill Requirement</th>
                    <th scope="col" className="p-4 w-28 text-center">Standard</th>
                    {comparisonResult.candidates.map((c) => {
                      const isWinner = c.application_id === winnerCandidateId;
                      return (
                        <th
                          key={c.application_id}
                          scope="col"
                          className={`p-4 text-center font-serif font-bold text-sm ${
                            isWinner ? 'bg-[#F8ECEF] text-[#7B1E3A]' : 'text-[#2A1015]'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            {isWinner && <Crown className="w-3.5 h-3.5 text-[#B8893B]" />}
                            <span>{c.candidate_name}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD0] text-xs">
                  {Object.entries(comparisonResult.skill_matrix).map(([skill, presenceMap]) => {
                    const isRequired = comparisonResult.required_skills.some(
                      (r) => r.toLowerCase() === skill.toLowerCase()
                    );

                    return (
                      <tr key={skill} className="hover:bg-[#FBF7F2] transition-colors">
                        <td className="p-4 font-semibold text-[#2A1015]">{skill}</td>
                        <td className="p-4 text-center font-mono">
                          {isRequired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A]/20">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30">
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
                              className={`p-4 text-center ${isWinner ? 'bg-[#F8ECEF]/30' : ''}`}
                            >
                              {hasSkill ? (
                                <span className="inline-flex items-center justify-center text-[#B8893B] font-bold">
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center text-[#6B5A55]/40">
                                  <XCircle className="w-4 h-4" />
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
      )}

    </div>
  );
}
