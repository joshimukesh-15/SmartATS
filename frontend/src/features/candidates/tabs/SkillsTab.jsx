import { Check, CheckCircle2, Minus, Sparkles, Layers } from 'lucide-react';
import { Badge } from '../../../components/ui/Tag';

export default function SkillsTab({ candidate, activeJob }) {
  if (!candidate) return null;

  const requiredSkills = activeJob?.required_skills || [];
  const matchedSkills = candidate.matched_skills || [];
  const preferredMatchedSkills = candidate.preferred_matched_skills || [];
  const equivalentSkills = candidate.equivalent_skills || {};

  // Compute coverage stats
  const totalRequired = requiredSkills.length;
  const matchedCount = requiredSkills.filter((req) =>
    matchedSkills.some((m) => m.toLowerCase().trim() === req.toLowerCase().trim())
  ).length;

  const coveragePercent = totalRequired > 0
    ? Math.round((matchedCount / totalRequired) * 100)
    : (matchedSkills.length > 0 ? 100 : 0);

  // Extracted other skills from resume if provided
  const otherSkills = (candidate.all_skills || candidate.extracted_skills || candidate.skills || [])
    .filter((s) => !matchedSkills.some((m) => m.toLowerCase().trim() === s.toLowerCase().trim()))
    .filter((s) => !preferredMatchedSkills.some((p) => p.toLowerCase().trim() === s.toLowerCase().trim()));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Skill Coverage Metric Banner */}
      <div className="p-4 rounded-[12px] bg-surface-alt/50 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[13px] font-semibold text-ink flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-champagne" strokeWidth={1.75} />
            <span>Required Skill Verification</span>
          </div>
          <div className="text-[13px] text-ink-muted">
            {totalRequired > 0 ? (
              <span>Verified <strong className="text-ink tabular-nums">{matchedCount}</strong> of <strong className="text-ink tabular-nums">{totalRequired}</strong> required skills</span>
            ) : (
              <span>{matchedSkills.length} verified candidate skill(s)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 bg-surface rounded-full h-2 border border-line overflow-hidden hidden sm:block">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(coveragePercent, 100)}%` }}
            />
          </div>
          <span className="px-2.5 py-1 rounded-[6px] bg-primary/10 border border-primary/20 text-primary font-bold text-[13px] tabular-nums shrink-0">
            {coveragePercent}% Verified
          </span>
        </div>
      </div>

      {/* 2. Required Skills Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[13px] text-ink-muted pb-1.5 border-b border-line font-medium px-1">
          <span>Skill Requirement</span>
          <span>Candidate Evidence</span>
        </div>

        <div className="space-y-1.5">
          {requiredSkills.length === 0 ? (
            <p className="text-[13px] text-ink-muted italic py-2 px-1">
              No required skills specified for this job role.
            </p>
          ) : (
            requiredSkills.map((skill, sIdx) => {
              const isFound = matchedSkills.some(
                (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
              );
              const equivSource = equivalentSkills[skill];

              return (
                <div
                  key={sIdx}
                  className="flex items-center justify-between text-[13px] py-2 px-3 rounded-[8px] bg-surface hover:bg-surface-alt/50 border border-line/60 transition-colors gap-2"
                >
                  <span className="font-medium text-ink">{skill}</span>

                  <div>
                    {isFound ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink bg-champagne-soft px-2.5 py-0.5 rounded-[6px]">
                        <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                        Found in resume
                      </span>
                    ) : equivSource ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink bg-champagne-soft/70 px-2.5 py-0.5 rounded-[6px] border border-champagne/30"
                        title="Recognized as equivalent skill family with 75% credit"
                      >
                        <CheckCircle2 className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                        Via {equivSource} (75%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted bg-surface-alt px-2.5 py-0.5 rounded-[6px] border border-dashed border-line font-medium">
                        <Minus className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                        Missing
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Preferred Bonus Skills Found */}
      {preferredMatchedSkills.length > 0 && (
        <div className="pt-3 border-t border-line space-y-2">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Sparkles className="w-3.5 h-3.5 text-champagne" strokeWidth={1.75} />
            <span>Preferred & Bonus Skills Found ({preferredMatchedSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {preferredMatchedSkills.map((s) => (
              <Badge key={s} variant="champagne" className="text-[12px] font-medium">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 4. Other Candidate Skills / Keyword Matches */}
      {otherSkills.length > 0 && (
        <div className="pt-3 border-t border-line space-y-2">
          <span className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider block">
            Additional Extracted Skills ({otherSkills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {otherSkills.slice(0, 20).map((s) => (
              <Badge key={s} variant="outline" className="text-[12px] text-ink-muted">
                {s}
              </Badge>
            ))}
            {otherSkills.length > 20 && (
              <span className="text-[12px] text-ink-muted self-center">
                +{otherSkills.length - 20} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
