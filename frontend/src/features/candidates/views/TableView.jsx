import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { ScoreBar, ScoreValue, Avatar, Tooltip, StatusBadge, Button } from '../../../components/ui';
import { STAGES, STAGE_CONFIG } from '../constants';
import { computeBreakdown } from '../../../lib/score';
import { useScoringWeights } from '../../leaderboard/hooks/useScoringWeights';
import WeightsTunerDialog from '../../leaderboard/WeightsTunerDialog';

export default function TableView({
  candidates = [],
  activeJob,
  activeJobId,
  selection,
  workflow,
  isJobReScoring = false,
  sortBy = 'score',
  sortOrder = 'desc',
  onSort,
}) {
  const navigate = useNavigate();
  const [openStageMenuId, setOpenStageMenuId] = useState(null);

  const {
    isWeightsOpen,
    setIsWeightsOpen,
    weightValues,
    setWeightValues,
    normalizedWeights,
    handleApplyWeights,
    handleSaveJobWeights,
    handleResetWeights,
    isSavingWeights,
  } = useScoringWeights(activeJob, activeJobId);

  const handleSortClick = (key) => {
    if (!onSort) return;
    onSort(key, sortBy === key ? (sortOrder === 'desc' ? 'asc' : 'desc') : key === 'name' ? 'asc' : 'desc');
  };

  const handleRowClick = (cand) => {
    const id = cand.application_id ?? cand.id ?? cand.candidate_id;
    if (id) navigate(`/studio/candidates?jobId=${encodeURIComponent(activeJobId)}&candidate=${encodeURIComponent(id)}`);
  };

  const renderSortHeader = (key, label, alignment = 'left', extraClasses = '') => {
    const isActive = sortBy === key;
    return (
      <th
        onClick={() => handleSortClick(key)}
        className={`py-3 font-medium cursor-pointer select-none group transition-colors hover:text-ink ${
          alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left'
        } ${extraClasses}`}
      >
        <div className={`inline-flex items-center gap-1 ${alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span>{label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isActive ? (sortOrder === 'asc' ? 'rotate-180 text-champagne' : 'rotate-0 text-champagne') : 'opacity-0 group-hover:opacity-40'
            }`}
            strokeWidth={1.75}
          />
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-ink">Leaderboard</h2>
          <p className="text-[13px] text-ink-muted">Ranking table sorted by deterministic composite matching scores.</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />} onClick={() => setIsWeightsOpen(true)}>
          Weights
        </Button>
      </div>

      {isJobReScoring && (
        <div data-testid="rescoring-banner" className="flex shrink-0 items-center gap-3 px-4 py-2 rounded-[10px] bg-champagne-soft border border-champagne/40 text-ink text-[13px] animate-fadeIn">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-champagne animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-ink">Re-scoring in progress</span>
            <span className="text-ink-muted ml-2">Corpus vectorizers and candidate scores are being recalculated in the background.</span>
          </div>
          <StatusBadge status="Re-scoring" />
        </div>
      )}

      <div className="overflow-x-auto rounded-[14px] border border-line bg-surface shadow-xs">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-line bg-surface-alt/40 text-[13px] text-ink-muted">
              <th className="hidden w-10 px-2 py-3 text-center sm:table-cell"><span className="sr-only">Compare Select</span></th>
              {renderSortHeader('rank', 'Rank', 'center', 'w-16 hidden sm:table-cell px-2')}
              {renderSortHeader('name', 'Candidate', 'left', 'px-3')}
              <th className="w-36 px-2 py-3 font-medium">Stage</th>
              {renderSortHeader('skills', 'Skills', 'right', 'w-24 hidden 2xl:table-cell px-2')}
              {renderSortHeader('text', 'Text Match', 'right', 'w-28 hidden 2xl:table-cell px-2')}
              {renderSortHeader('score', 'Score', 'right', 'w-36 px-3')}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {candidates.map((cand, idx) => {
              const breakdown = computeBreakdown(cand, activeJob || {});
              const isCompared = selection?.selectedForCompare?.includes(cand.application_id);
              const stageKey = cand.review_stage || 'New';
              const stageConf = STAGE_CONFIG[stageKey] || STAGE_CONFIG.New;
              const matchedSkills = cand.matched_skills || [];
              const visibleSkills = matchedSkills.slice(0, 3);
              const overflowSkills = matchedSkills.slice(3);

              return (
                <tr key={cand.application_id || idx} onClick={() => handleRowClick(cand)} className="cursor-pointer select-none transition-colors hover:bg-surface-alt/50">
                  <td className="hidden px-2 py-3 text-center sm:table-cell" onClick={(e) => { e.stopPropagation(); selection?.handleToggleCompare(cand.application_id); }}>
                    <input type="checkbox" checked={Boolean(isCompared)} onChange={() => {}} className="rounded-[4px] border-line accent-primary cursor-pointer" aria-label={`Select ${cand.candidate_name || 'candidate'} for compare`} />
                  </td>
                  <td className="hidden px-2 py-3 text-center sm:table-cell">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-[6px] text-[13px] font-semibold tabular-nums ${idx === 0 ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink'}`}>
                      {cand.rank || idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={cand.candidate_name || 'Candidate'} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-ink text-[15px] leading-[1.4] truncate">{cand.candidate_name || 'Candidate'}</span>
                          {cand.processing_status && <StatusBadge status={cand.processing_status} />}
                        </div>
                        <div className="text-[13px] leading-[1.5] text-ink-muted truncate">{cand.candidate_email || '—'}</div>
                        {(cand.experience_years !== undefined || cand.education_level) && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[13px] leading-[1.5] text-ink-muted flex-wrap">
                            {cand.experience_years !== undefined && <span className="font-medium text-ink tabular-nums">{cand.experience_years} yrs</span>}
                            {cand.seniority_level && <><span className="text-ink-subtle">·</span><span>{cand.seniority_level}</span></>}
                            {cand.education_level && cand.education_level !== 'Unspecified' && <><span className="text-ink-subtle">·</span><span className="truncate max-w-[120px]">{cand.education_level}</span></>}
                          </div>
                        )}
                        {matchedSkills.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {visibleSkills.map((sk, sIdx) => <span key={sIdx} className="px-1.5 py-0.5 rounded-[4px] bg-surface text-ink text-[13px] border border-line">{sk}</span>)}
                            {overflowSkills.length > 0 && <Tooltip content={overflowSkills.join(', ')}><span className="px-1.5 py-0.5 rounded-[4px] bg-surface-alt text-ink-muted text-[13px] border border-line cursor-help">+{overflowSkills.length}</span></Tooltip>}
                            {cand.equivalent_skills && Object.keys(cand.equivalent_skills).length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[13px] bg-champagne-soft text-ink font-medium border border-champagne/30">
                                <span className="tabular-nums">+{Object.keys(cand.equivalent_skills).length} equiv skill</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        aria-label={`Change stage for candidate ${idx + 1}`}
                        onClick={() => setOpenStageMenuId(openStageMenuId === cand.application_id ? null : cand.application_id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer border ${stageConf.badge}`}
                      >
                        <span aria-hidden="true">{stageKey}</span>
                        <ChevronDown className="w-4 h-4 opacity-60 ml-0.5" strokeWidth={1.75} />
                      </button>
                      {openStageMenuId === cand.application_id && (
                        <div className="absolute left-0 mt-1 w-36 rounded-[8px] bg-surface border border-line shadow-xl z-30 py-1 animate-fadeIn">
                          {STAGES.map((s) => {
                            const isCurrent = stageKey === s || (stageKey === 'Interview' && s === 'Interviewing');
                            return (
                              <button key={s} type="button" onClick={() => { workflow?.handleQuickStageChange?.(cand, s); setOpenStageMenuId(null); }} className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface-alt transition-colors flex items-center justify-between cursor-pointer ${isCurrent ? 'font-semibold text-primary bg-surface-alt/60' : 'text-ink'}`}>
                                <span>{s}</span>
                                {isCurrent && <Check className="w-4 h-4 text-primary" strokeWidth={1.75} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-2 py-3 text-right tabular-nums text-ink-muted text-[13px] 2xl:table-cell">{breakdown.skillsCoveredPercent.toFixed(1)}%</td>
                  <td className="hidden px-2 py-3 text-right tabular-nums text-ink-muted text-[13px] 2xl:table-cell">{breakdown.textMatchPercent.toFixed(1)}%</td>
                  <td className="py-3 px-3">
                    <div className="space-y-1 text-right">
                      <ScoreValue score={breakdown.finalScore} size="sm" />
                      <ScoreBar skillsPoints={breakdown.skillsCoveredPoints} textMatchPoints={breakdown.textMatchPoints} experiencePoints={breakdown.experiencePoints} educationPoints={breakdown.educationPoints} finalScore={breakdown.finalScore} height="h-1" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <WeightsTunerDialog
        isOpen={isWeightsOpen}
        onClose={() => setIsWeightsOpen(false)}
        weightValues={weightValues}
        setWeightValues={setWeightValues}
        normalizedWeights={normalizedWeights}
        onResetWeights={handleResetWeights}
        onSaveJobWeights={handleSaveJobWeights}
        onApplyWeights={handleApplyWeights}
        isSavingWeights={isSavingWeights}
      />
    </div>
  );
}
