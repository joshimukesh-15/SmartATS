import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Printer, Users } from 'lucide-react';
import { useJobs, useRankings, useCompareQuery } from '../../hooks';
import { Select, Button, EmptyState, Skeleton } from '../../components/ui';
import CompareMatrixTable from './CompareMatrixTable';

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
    return Array.from(new Set([...required, ...preferred]));
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
                  <span>{cand.candidate_name || 'Candidate'}</span>
                  <span className="opacity-70 text-[13px] tabular-nums">
                    {(cand.final_score ?? 0).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls: Differences only toggle */}
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
        <CompareMatrixTable
          comparedCandidates={comparedCandidates}
          winnerId={winnerId}
          activeJob={activeJob}
          visibleSkills={visibleSkills}
        />
      )}
    </div>
  );
}
