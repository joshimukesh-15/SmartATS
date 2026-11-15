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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
            Differential Analysis
          </span>
          <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
            Candidate Comparison Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Side-by-side technical skill evaluation across multiple candidate profiles.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('rankings')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition active:scale-[0.98] self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Candidate Selector Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
            Selected for Comparison (2–5)
          </span>
          <span className="font-mono text-xs text-blue-400 font-semibold">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
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
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !comparisonResult ? (
        <div className="p-12 text-center text-slate-500 text-xs font-mono">
          Select at least 2 candidates to generate side-by-side comparison.
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {comparisonResult.candidates.map((c) => (
              <div
                key={c.application_id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white truncate">{c.candidate_name}</h3>
                  <div className="text-2xl font-bold text-white mt-1">
                    {c.final_score.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Keywords:</span>
                    <span className="font-semibold text-emerald-400">{c.keyword_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Context:</span>
                    <span className="font-semibold text-blue-400">{c.tfidf_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Skills:</span>
                    <span className="font-semibold text-white">{c.total_extracted_skills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missing Req:</span>
                    <span className={`font-semibold ${c.missing_skills.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.missing_skills.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Common Skills Highlight Box */}
          {comparisonResult.common_matched_skills && comparisonResult.common_matched_skills.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
                Shared Technical Competencies (Possessed by all selected candidates)
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {comparisonResult.common_matched_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Side-by-Side Skill Matrix Table */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Competency Alignment Matrix
            </h2>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="comparison-matrix-caption"
              className="table-wrapper bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <caption id="comparison-matrix-caption" className="sr-only">
                  Technical skill comparison matrix
                </caption>
                <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th scope="col" className="p-4">Skill Requirement</th>
                    <th scope="col" className="p-4 w-28 text-center">Standard</th>
                    {comparisonResult.candidates.map((c) => (
                      <th key={c.application_id} scope="col" className="p-4 text-center text-white">
                        {c.candidate_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {Object.entries(comparisonResult.skill_matrix).map(([skill, presenceMap]) => {
                    const isRequired = comparisonResult.required_skills.some(
                      (r) => r.toLowerCase() === skill.toLowerCase()
                    );

                    return (
                      <tr key={skill} className="hover:bg-slate-850/60 transition-colors">
                        <td className="p-4 font-semibold text-white">{skill}</td>
                        <td className="p-4 text-center font-mono">
                          {isRequired ? (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              PREFERRED
                            </span>
                          )}
                        </td>
                        {comparisonResult.candidates.map((c) => {
                          const hasSkill = presenceMap[c.candidate_name];
                          return (
                            <td key={c.application_id} className="p-4 text-center">
                              {hasSkill ? (
                                <span className="inline-flex items-center justify-center text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center text-rose-500/40">
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
