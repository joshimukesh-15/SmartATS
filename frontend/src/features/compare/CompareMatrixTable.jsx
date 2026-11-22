import { Check, Minus, Crown } from 'lucide-react';
import { ScoreValue, ScoreBar } from '../../components/ui';
import { computeBreakdown } from '../../lib/score';

export default function CompareMatrixTable({
  comparedCandidates,
  winnerId,
  activeJob,
  visibleSkills,
}) {
  return (
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
                  className={`px-5 py-4 align-top w-56 text-left transition-colors ${
                    isWinner ? 'bg-surface-alt/70' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-ink-muted tabular-nums">
                        Rank #{cand.rank || '—'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded-[6px] bg-champagne-soft text-ink border border-champagne/40">
                          <Crown className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                          <span>Top Fit</span>
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-ink text-[15px] truncate leading-[1.4]">
                      {cand.candidate_name || 'Candidate'}
                    </div>
                    {(cand.experience_years !== undefined || cand.education_level) && (
                      <div className="text-[13px] leading-[1.5] text-ink-muted truncate">
                        {cand.experience_years !== undefined && (
                          <span className="tabular-nums">{cand.experience_years} yrs</span>
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

        {/* Matrix Body: Experience, Education & Per-skill check/minus */}
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
                      <span className="text-[13px] text-ink-subtle font-medium">
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
                          isWinner ? 'bg-surface-alt/40' : ''
                        }`}
                      >
                        {hasSkill ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[6px] bg-primary/10 text-primary">
                            <Check className="w-4 h-4 text-primary" strokeWidth={1.75} />
                          </span>
                        ) : equiv ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-surface-alt text-ink text-[13px] font-medium border border-line"
                            title="Equivalent skill match with 75% credit"
                          >
                            <Check className="w-4 h-4 text-primary" strokeWidth={1.75} />
                            <span>via {equiv}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[6px] bg-surface-alt text-ink-subtle">
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
  );
}
