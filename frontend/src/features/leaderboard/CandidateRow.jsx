import { Check, ChevronDown } from 'lucide-react';
import { ScoreBar, ScoreValue, Avatar, Tooltip } from '../../components/ui';
import { STAGES, STAGE_CONFIG } from '../candidates';

export default function CandidateRow({
  candidate,
  idx,
  isSelected,
  isCompared,
  breakdown,
  onSelectCandidate,
  onToggleCompare,
  openStageMenuId,
  setOpenStageMenuId,
  onQuickStageChange,
  density = 'comfortable',
}) {
  const stageKey = candidate.review_stage || 'New';
  const stageConf = STAGE_CONFIG[stageKey] || STAGE_CONFIG.New;

  const matchedSkills = candidate.matched_skills || [];
  const visibleSkills = matchedSkills.slice(0, 3);
  const overflowSkills = matchedSkills.slice(3);

  const isCompact = density === 'compact';
  const cellPadding = isCompact ? 'py-2 px-3' : 'py-3.5 px-4';

  return (
    <tr
      onClick={() => onSelectCandidate(idx)}
      className={`transition-colors cursor-pointer select-none ${
        isSelected ? 'bg-surface-alt font-medium' : 'hover:bg-surface-alt/50'
      }`}
    >
      {/* Checkbox for compare */}
      <td
        className={`px-3 ${isCompact ? 'py-2' : 'py-3.5'} text-center`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompare(candidate.application_id);
        }}
      >
        <input
          type="checkbox"
          checked={isCompared}
          onChange={() => {}}
          className="rounded-[4px] border-line accent-primary cursor-pointer"
        />
      </td>

      {/* Rank */}
      <td className={`px-3 ${isCompact ? 'py-2' : 'py-3.5'} text-center`}>
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-[6px] text-[13px] font-semibold tabular-nums ${
            idx === 0 ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink'
          }`}
        >
          {candidate.rank || idx + 1}
        </span>
      </td>

      {/* Candidate Avatar, Name, Email, Experience & Capped Skill Chips */}
      <td className={cellPadding}>
        <div className="flex items-center gap-3">
          <Avatar name={candidate.candidate_name || 'Candidate'} size="sm" />
          <div className="min-w-0">
            <div className="font-semibold text-ink text-[15px] leading-[1.4] truncate">
              {candidate.candidate_name || 'Candidate'}
            </div>
            <div className="text-[13px] leading-[1.5] text-ink-muted truncate">
              {candidate.candidate_email || '—'}
            </div>

            {/* Experience & Seniority metadata */}
            {(candidate.experience_years !== undefined || candidate.education_level) && (
              <div className="flex items-center gap-1.5 mt-0.5 text-[13px] leading-[1.5] text-ink-muted flex-wrap">
                {candidate.experience_years !== undefined && (
                  <span className="font-medium text-ink tabular-nums">
                    {candidate.experience_years} yrs
                  </span>
                )}
                {candidate.seniority_level && (
                  <>
                    <span className="text-ink-subtle">·</span>
                    <span>{candidate.seniority_level}</span>
                  </>
                )}
                {candidate.education_level &&
                  candidate.education_level !== 'Unspecified' && (
                    <>
                      <span className="text-ink-subtle">·</span>
                      <span className="truncate max-w-[120px]">
                        {candidate.education_level}
                      </span>
                    </>
                  )}
              </div>
            )}

            {/* Skill chips capped at 3 with +N overflow tooltip */}
            {matchedSkills.length > 0 && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {visibleSkills.map((sk, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-1.5 py-0.5 rounded-[4px] bg-surface text-ink text-[13px] border border-line"
                  >
                    {sk}
                  </span>
                ))}
                {overflowSkills.length > 0 && (
                  <Tooltip content={overflowSkills.join(', ')}>
                    <span
                      className="px-1.5 py-0.5 rounded-[4px] bg-surface-alt text-ink-muted text-[13px] border border-line cursor-help"
                    >
                      +{overflowSkills.length}
                    </span>
                  </Tooltip>
                )}
                {candidate.equivalent_skills &&
                  Object.keys(candidate.equivalent_skills).length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[13px] bg-champagne-soft text-ink font-medium border border-champagne/30">
                      <span className="tabular-nums">
                        +{Object.keys(candidate.equivalent_skills).length} equiv skill
                      </span>
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Interactive Stage Badge Dropdown */}
      <td className={`px-3 ${isCompact ? 'py-2' : 'py-3.5'}`} onClick={(e) => e.stopPropagation()}>
        <div className="relative inline-block text-left">
          <button
            type="button"
            aria-label={`Change stage for candidate ${idx + 1}`}
            onClick={() =>
              setOpenStageMenuId(
                openStageMenuId === candidate.application_id
                  ? null
                  : candidate.application_id
              )
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer border ${
              stageConf.badge
            }`}
            title="Click to transition applicant pipeline stage"
          >
            <span aria-hidden="true">{stageKey}</span>
            <ChevronDown className="w-4 h-4 opacity-60 ml-0.5" strokeWidth={1.75} />
          </button>

          {openStageMenuId === candidate.application_id && (
            <div className="absolute left-0 mt-1 w-36 rounded-[8px] bg-surface border border-line shadow-xl z-30 py-1 animate-fadeIn">
              {STAGES.map((s) => {
                const isCurrent =
                  stageKey === s || (stageKey === 'Interview' && s === 'Interviewing');
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onQuickStageChange(candidate, s);
                      setOpenStageMenuId(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface-alt transition-colors flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'font-semibold text-primary bg-surface-alt/60'
                        : 'text-ink'
                    }`}
                  >
                    <span>{s}</span>
                    {isCurrent && <Check className="w-4 h-4 text-primary" strokeWidth={1.75} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </td>

      {/* Skills Covered % */}
      <td className={`px-3 ${isCompact ? 'py-2' : 'py-3.5'} text-right tabular-nums text-ink-muted text-[13px] hidden sm:table-cell`}>
        {breakdown.skillsCoveredPercent.toFixed(1)}%
      </td>

      {/* Text Match % */}
      <td className={`px-3 ${isCompact ? 'py-2' : 'py-3.5'} text-right tabular-nums text-ink-muted text-[13px] hidden sm:table-cell`}>
        {breakdown.textMatchPercent.toFixed(1)}%
      </td>

      {/* Final Score with Slim Bar */}
      <td className={cellPadding}>
        <div className="space-y-1 text-right">
          <ScoreValue score={breakdown.finalScore} size="sm" />
          <ScoreBar
            skillsPoints={breakdown.skillsCoveredPoints}
            textMatchPoints={breakdown.textMatchPoints}
            experiencePoints={breakdown.experiencePoints}
            educationPoints={breakdown.educationPoints}
            finalScore={breakdown.finalScore}
            height="h-1"
          />
        </div>
      </td>
    </tr>
  );
}
