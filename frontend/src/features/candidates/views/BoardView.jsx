import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Drawer, EmptyState, Button } from '../../../components/ui';
import { STAGES, normalizeStage } from '../constants';
import CandidateDetail from '../CandidateDetail';

const STAGE_DOT_MAP = {
  New: 'bg-ink-muted',
  Reviewing: 'bg-champagne',
  Interviewing: 'bg-primary',
  Offer: 'bg-purple-500',
  Hired: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
};

export default function BoardView({
  candidates = [],
  activeJob,
  selection,
  workflow,
}) {
  const navigate = useNavigate();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Group candidates into stages
  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STAGES.map((s) => [s, []]));
    candidates.forEach((cand) => {
      const st = normalizeStage(cand.review_stage);
      if (grouped[st]) {
        grouped[st].push(cand);
      } else {
        grouped.New.push(cand);
      }
    });
    return grouped;
  }, [candidates]);

  const activeCandidate = useMemo(() => {
    if (!selectedCardId) return selection?.selectedCandidate || null;
    return candidates.find(
      (c) => String(c.application_id ?? c.id ?? c.candidate_id) === String(selectedCardId)
    ) || null;
  }, [candidates, selectedCardId, selection?.selectedCandidate]);

  const handleCardClick = (cand) => {
    const id = cand.application_id ?? cand.id ?? cand.candidate_id;
    setSelectedCardId(id);
    selection?.setSelectedCandidateId?.(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Board Header for Tests & Clarity */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold tracking-tight text-ink">Pipeline Board</h2>
            <span className="text-[13px] text-ink-subtle">·</span>
            <span className="text-[13px] text-ink-muted tabular-nums">
              {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}
            </span>
          </div>
          <p className="text-[13px] text-ink-muted">
            Drag or review candidates across hiring stages for {activeJob?.title || 'selected role'}.
          </p>
        </div>
      </div>

      {/* When zero candidates in board view */}
      {candidates.length === 0 ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-[14px] border border-dashed border-line bg-surface p-8">
          <EmptyState
            title="No candidates in pipeline"
            description="Upload resumes for this job opening to track candidates through your hiring stages."
            action={<Button onClick={() => navigate('/studio/upload')}>Upload resumes</Button>}
          />
        </div>
      ) : (
        /* 6 Stage Columns: horizontal row of six 280px columns in overflow-x wrapper */
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-4">
            {STAGES.map((stage) => {
              const stageList = columns[stage] || [];
              const dotColor = STAGE_DOT_MAP[stage] || 'bg-ink-muted';

              return (
                <div
                  key={stage}
                  className="flex w-[280px] shrink-0 flex-col rounded-[14px] border border-line bg-surface p-3 shadow-xs"
                >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between border-b border-line/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    <span className="text-[14px] font-semibold text-ink">{stage}</span>
                  </div>
                  <span className="rounded-[6px] bg-surface-alt px-2 py-0.5 text-[12px] font-semibold tabular-nums text-ink-muted">
                    {stageList.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[140px]">
                  {stageList.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-[10px] border border-dashed border-line/60 text-center text-[12px] text-ink-subtle">
                      No candidates
                    </div>
                  ) : (
                    stageList.map((cand) => {
                      const matchPercent = Math.round(Number(cand.final_score ?? 0));
                      const years = cand.experience_years;
                      const id = cand.application_id ?? cand.id ?? cand.candidate_id;

                      return (
                        <div
                          key={id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleCardClick(cand)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCardClick(cand);
                            }
                          }}
                          className="group cursor-pointer rounded-[10px] border border-line bg-surface p-3 transition-all hover:border-primary/40 hover:bg-surface-alt/40 shadow-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <Avatar name={cand.candidate_name || 'Candidate'} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[14px] font-semibold text-ink group-hover:text-primary">
                                {cand.candidate_name || 'Candidate'}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
                                <span className="font-semibold tabular-nums text-ink">
                                  {matchPercent}% match
                                </span>
                                {years !== undefined && (
                                  <>
                                    <span className="text-ink-subtle">·</span>
                                    <span className="tabular-nums">{years} yrs</span>
                                  </>
                                )}
                                {cand.seniority_level && (
                                  <>
                                    <span className="text-ink-subtle">·</span>
                                    <span className="truncate">{cand.seniority_level}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {cand.matched_skills && cand.matched_skills.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {cand.matched_skills.slice(0, 2).map((sk) => (
                                <span
                                  key={sk}
                                  className="rounded-[4px] border border-line bg-surface-alt px-1.5 py-0.5 text-[11px] text-ink-muted"
                                >
                                  {sk}
                                </span>
                              ))}
                              {cand.matched_skills.length > 2 && (
                                <span className="text-[11px] text-ink-subtle">
                                  +{cand.matched_skills.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={activeCandidate ? `${activeCandidate.candidate_name} — Dossier` : 'Candidate Dossier'}
        side="right"
        size="lg"
      >
        {activeCandidate && (
          <CandidateDetail
            candidate={activeCandidate}
            activeJob={activeJob}
            stageWorkflow={workflow}
            selectedForCompare={selection?.selectedForCompare || []}
            onToggleCompare={() => selection?.handleToggleCompare?.(activeCandidate.application_id)}
          />
        )}
      </Drawer>
    </div>
  );
}
