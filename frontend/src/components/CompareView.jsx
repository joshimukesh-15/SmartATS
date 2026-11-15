import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DFD5] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#8A8477]">
            Differential Analysis
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1915] mt-1">
            Candidate Comparison Matrix
          </h1>
          <p className="text-xs text-[#59554D] mt-1 font-sans">
            Side-by-side technical skill evaluation across multiple candidate profiles.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('rankings')}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#1A1915] rounded border border-[#D6CEBF] text-xs font-semibold transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Candidate Selector Bar */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#8A8477]">
            Selected for Comparison (2–5)
          </span>
          <span className="font-mono text-xs text-[#1A1915] font-semibold">
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
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-[#1A1915] border-[#1A1915] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#E5DFD5] text-[#59554D] hover:text-[#1A1915]'
                }`}
              >
                <span>{c.candidate_name}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {c.final_score.toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-7 h-7 border-2 border-[#1A1915] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !comparisonResult ? (
        <div className="p-12 text-center text-[#8A8477] text-xs font-mono">
          Select at least 2 candidates to generate side-by-side comparison.
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {comparisonResult.candidates.map((c) => (
              <div
                key={c.application_id}
                className="bg-white border border-[#E5DFD5] rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="border-b border-[#F3EFEA] pb-3">
                  <h3 className="font-serif text-base font-bold text-[#1A1915] truncate">{c.candidate_name}</h3>
                  <div className="font-serif text-2xl font-bold text-[#1A1915] mt-1">
                    {c.final_score.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8A8477]">Keyword Match:</span>
                    <span className="font-semibold text-[#1E7E4E]">{c.keyword_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8477]">TF-IDF Sim:</span>
                    <span className="font-semibold text-[#59554D]">{c.tfidf_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8477]">Total Skills:</span>
                    <span className="font-semibold text-[#1A1915]">{c.total_extracted_skills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8477]">Missing Req:</span>
                    <span className={`font-semibold ${c.missing_skills.length === 0 ? 'text-[#1E7E4E]' : 'text-[#B9382C]'}`}>
                      {c.missing_skills.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Common Skills Highlight Box */}
          {comparisonResult.common_matched_skills && comparisonResult.common_matched_skills.length > 0 && (
            <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#8A8477]">
                Shared Technical Competencies (Possessed by all selected candidates)
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {comparisonResult.common_matched_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-white text-[#1E7E4E] border border-[#C2ECD4]"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Side-by-Side Skill Matrix Table (Modern Web Guidance Compliant) */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#1A1915]">
              Competency Alignment Matrix
            </h2>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="comparison-matrix-caption"
              className="table-wrapper bg-white border border-[#E5DFD5] rounded-xl shadow-xs"
            >
              <table className="w-full text-left border-collapse">
                <caption id="comparison-matrix-caption" className="sr-only">
                  Technical skill comparison matrix
                </caption>
                <thead className="bg-[#FAF8F5] sticky top-0 z-10 border-b border-[#E5DFD5] text-[10px] uppercase font-mono tracking-wider text-[#8A8477] font-semibold">
                  <tr>
                    <th scope="col" className="p-4">Skill Requirement</th>
                    <th scope="col" className="p-4 w-28 text-center">Standard</th>
                    {comparisonResult.candidates.map((c) => (
                      <th key={c.application_id} scope="col" className="p-4 text-center">
                        {c.candidate_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5] text-xs">
                  {Object.entries(comparisonResult.skill_matrix).map(([skill, presenceMap]) => {
                    const isRequired = comparisonResult.required_skills.some(
                      (r) => r.toLowerCase() === skill.toLowerCase()
                    );

                    return (
                      <tr key={skill} className="hover:bg-[#FAF8F5] transition">
                        <td className="p-4 font-semibold text-[#1A1915]">{skill}</td>
                        <td className="p-4 text-center font-mono">
                          {isRequired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFFBF4] text-[#1E7E4E] border border-[#C2ECD4]">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">
                              PREFERRED
                            </span>
                          )}
                        </td>
                        {comparisonResult.candidates.map((c) => {
                          const hasSkill = presenceMap[c.candidate_name];
                          return (
                            <td key={c.application_id} className="p-4 text-center">
                              {hasSkill ? (
                                <span className="inline-flex items-center justify-center text-[#1E7E4E] font-bold">
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center text-[#B9382C]/50">
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
