import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Minus, Printer, Users } from 'lucide-react';
import { useJobs, useRankings, useCompareQuery } from '../../hooks';
import { Select, Button, ScoreValue, ScoreBar, EmptyState, Skeleton } from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';
import { computeBreakdown } from '../../lib/score';

export default function ComparePage() {
  const { jobId: routeJobId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  // Active Job ID
  const activeJobId = routeJobId || (jobs.length > 0 ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((j) => String(j.job_id) === String(activeJobId));

  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(activeJobId);

  // Selected candidate IDs from search param ?apps=id1,id2
  const appsParam = searchParams.get('apps');
  const selectedAppIds = useMemo(() => {
    if (appsParam) {
      return appsParam.split(',').filter(Boolean);
    }
    // Default to first 2-3 candidates if available
    const rankings = rankingsData?.rankings || [];
    return rankings.slice(0, 3).map((r) => r.application_id);
  }, [appsParam, rankingsData]);

  const [showDiffOnly, setShowDiffOnly] = useState(false);

  // Query comparison data from API
  const { data: compareResult, isLoading: compareLoading } = useCompareQuery(
    activeJobId,
    selectedAppIds
  );

  const candidatesList = useMemo(() => rankingsData?.rankings || [], [rankingsData]);

  // Identify comparison candidates from rankings data or compareResult
  const comparedCandidates = useMemo(() => {
    if (compareResult?.candidates?.length) {
      return compareResult.candidates;
    }
    return candidatesList.filter((c) => selectedAppIds.includes(c.application_id));
  }, [compareResult, candidatesList, selectedAppIds]);

  // Identify highest scorer (winner)
  const winnerId = useMemo(() => {
    if (!comparedCandidates.length) return null;
    let highest = comparedCandidates[0];
    for (const c of comparedCandidates) {
      if ((c.final_score ?? 0) > (highest.final_score ?? 0)) {
        highest = c;
      }
    }
    return highest.application_id;
  }, [comparedCandidates]);

  // All relevant skills (required + preferred)
  const allSkills = useMemo(() => {
    const required = activeJob?.required_skills || [];
    const preferred = activeJob?.preferred_skills || [];
    const union = Array.from(new Set([...required, ...preferred]));
    return union;
  }, [activeJob]);

  // Filter skills if showDiffOnly is checked
  const visibleSkills = useMemo(() => {
    if (!showDiffOnly) return allSkills;

    return allSkills.filter((skill) => {
      const statuses = comparedCandidates.map((c) =>
        Boolean(
          c.matched_skills?.some((m) => m.toLowerCase().trim() === skill.toLowerCase().trim())
        )
      );
      // Keep only if not all true and not all false
      const allTrue = statuses.every(Boolean);
      const allFalse = statuses.every((s) => !s);
      return !allTrue && !allFalse;
    });
  }, [allSkills, comparedCandidates, showDiffOnly]);

  const handleToggleCandidate = (appId) => {
    let next;
    if (selectedAppIds.includes(appId)) {
      next = selectedAppIds.filter((id) => id !== appId);
    } else {
      if (selectedAppIds.length >= 5) return;
      next = [...selectedAppIds, appId];
    }
    setSearchParams({ apps: next.join(',') });
  };

  const handleJobChange = (newJobId) => {
    navigate(`/studio/compare/${newJobId}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
        <div>
          <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
            Candidate Comparison
          </h1>
          <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
            Side-by-side technical skill verification matrix and fit differential.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {jobs.length > 0 && (
            <div className="w-56">
              <Select value={activeJobId} onChange={(e) => handleJobChange(e.target.value)}>
                {jobs.map((job) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" strokeWidth={1.75} />}
            onClick={() => window.print()}
          >
            Print shortlist
          </Button>
        </div>
      </div>

      {/* Candidate Selector Chips */}
      {candidatesList.length > 0 && (
        <div className="p-4 sm:p-6 rounded-[14px] border border-line bg-surface space-y-3">
          <div className="flex items-center justify-between text-[13px] font-medium text-ink">
            <span>Select candidates to compare (up to 5):</span>
            <span className="text-ink-muted tabular-nums">{selectedAppIds.length} / 5 selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidatesList.map((cand) => {
              const selected = selectedAppIds.includes(cand.application_id);
              return (
                <button
                  key={cand.application_id}
                  type="button"
                  onClick={() => handleToggleCandidate(cand.application_id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium border transition-colors cursor-pointer select-none ${
                    selected
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-alt text-ink border-line hover:border-ink-subtle'
                  }`}
                >
                  <span>{cleanCandidateName(cand.candidate_name)}</span>
                  <span className="opacity-70 text-[13px] tabular-nums">
                    {(cand.final_score ?? 0).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] font-medium text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDiffOnly}
            onChange={(e) => setShowDiffOnly(e.target.checked)}
            className="rounded-[4px] border-line accent-primary cursor-pointer"
          />
          <span>Show differences only</span>
        </label>
      </div>

      {/* Comparison Matrix Table */}
      {jobsLoading || rankingsLoading || compareLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-[10px]" />
          <Skeleton className="h-64 w-full rounded-[14px]" />
        </div>
      ) : comparedCandidates.length < 2 ? (
        <EmptyState
          icon={<Users className="w-5 h-5" strokeWidth={1.75} />}
          title="Select at least 2 candidates"
          description="Choose 2 to 5 candidates above to compare competency coverage side by side."
        />
      ) : (
        <div className="rounded-[14px] border border-line bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left text-[14px] text-ink border-collapse min-w-[640px]">
            {/* Table Header: Candidate Summary Cards */}
            <thead>
              <tr className="border-b border-line bg-surface-alt/40">
                <th className="sticky left-0 bg-surface z-10 px-5 py-4 w-52 font-medium text-ink-muted text-[13px] border-r border-line">
                  Competency Matrix
                </th>
                {comparedCandidates.map((cand) => {
                  const isWinner = cand.application_id === winnerId;
                  const breakdown = computeBreakdown(cand, activeJob);

                  return (
                    <th
                      key={cand.application_id}
                      className={`px-5 py-4 align-top w-56 text-left ${
                        isWinner ? 'bg-champagne-soft/40' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-ink-muted tabular-nums">
                            Rank #{cand.rank || '—'}
                          </span>
                          {isWinner && (
                            <span className="text-[13px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-champagne text-ink">
                              Leading
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-ink text-[15px] truncate leading-[1.4]">
                          {cleanCandidateName(cand.candidate_name)}
                        </div>
                        {(cand.experience_years !== undefined || cand.education_level) && (
                          <div className="text-[13px] leading-[1.5] text-ink-muted truncate">
                            {cand.experience_years !== undefined ? (
                              <span className="tabular-nums">{cand.experience_years} yrs</span>
                            ) : (
                              ''
                            )}
                            {cand.seniority_level ? ` · ${cand.seniority_level}` : ''}
                            {cand.education_level && cand.education_level !== 'Unspecified'
                              ? ` · ${cand.education_level}`
                              : ''}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <ScoreValue score={breakdown.finalScore} size="md" />
                            <span className="text-[13px] text-ink-muted tabular-nums">
                              {breakdown.skillsCoveredPercent.toFixed(0)}% skills
                            </span>
                          </div>
                          <ScoreBar
                            skillsPoints={breakdown.skillsCoveredPoints}
                            textMatchPoints={breakdown.textMatchPoints}
                            experiencePoints={breakdown.experiencePoints}
                            educationPoints={breakdown.educationPoints}
                            finalScore={breakdown.finalScore}
                            height="h-1.5"
                          />
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Body: Experience, Education & Per-skill check/dash */}
            <tbody className="divide-y divide-line">
              {/* Profile Comparison Rows */}
              <tr className="bg-surface-alt/30">
                <td className="sticky left-0 bg-surface z-10 px-5 py-3 font-semibold text-[13px] text-ink border-r border-line">
                  Experience & Seniority
                </td>
                {comparedCandidates.map((cand) => (
                  <td
                    key={cand.application_id}
                    className="px-5 py-3 text-center text-[13px] text-ink font-medium tabular-nums"
                  >
                    {cand.experience_years !== undefined ? `${cand.experience_years} yrs` : '—'}
                    {cand.seniority_level && (
                      <span className="text-ink-muted"> ({cand.seniority_level})</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="bg-surface-alt/30">
                <td className="sticky left-0 bg-surface z-10 px-5 py-3 font-semibold text-[13px] text-ink border-r border-line">
                  Education Credential
                </td>
                {comparedCandidates.map((cand) => (
                  <td
                    key={cand.application_id}
                    className="px-5 py-3 text-center text-[13px] text-ink font-medium"
                  >
                    {cand.education_level || 'Unspecified'}
                  </td>
                ))}
              </tr>

              {visibleSkills.length === 0 ? (
                <tr>
                  <td
                    colSpan={comparedCandidates.length + 1}
                    className="p-8 text-center text-ink-muted text-[13px]"
                  >
                    No skill differences found between selected candidates.
                  </td>
                </tr>
              ) : (
                visibleSkills.map((skill) => {
                  const isRequired = activeJob?.required_skills?.includes(skill);

                  return (
                    <tr key={skill} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Sticky Skill Column */}
                      <td className="sticky left-0 bg-surface z-10 px-5 py-3 font-medium text-[13px] border-r border-line">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-ink">{skill}</span>
                          <span className="text-[13px] text-ink-subtle uppercase font-medium">
                            {isRequired ? 'Req' : 'Opt'}
                          </span>
                        </div>
                      </td>

                      {/* Status per Candidate */}
                      {comparedCandidates.map((cand) => {
                        const isWinner = cand.application_id === winnerId;
                        const hasSkill = cand.matched_skills?.some(
                          (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
                        );
                        const equiv = cand.equivalent_skills?.[skill];

                        return (
                          <td
                            key={cand.application_id}
                            className={`px-5 py-3 text-center ${
                              isWinner ? 'bg-champagne-soft/20' : ''
                            }`}
                          >
                            {hasSkill ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-champagne-soft text-ink">
                                <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                              </span>
                            ) : equiv ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-champagne-soft/70 text-ink text-[13px] font-medium border border-champagne/30"
                                title="Equivalent skill match with 75% credit"
                              >
                                <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                                <span>via {equiv}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-alt text-ink-subtle">
                                <Minus className="w-4 h-4" strokeWidth={1.75} />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
