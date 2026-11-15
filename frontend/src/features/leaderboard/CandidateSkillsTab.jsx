import { Check, Minus } from 'lucide-react';

export default function CandidateSkillsTab({ candidate, activeJob }) {
  if (!candidate) return null;

  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between text-[13px] text-ink-muted pb-1 border-b border-line">
        <span>Skill Requirement</span>
        <span>Candidate Evidence</span>
      </div>
      <div className="space-y-1.5">
        {activeJob?.required_skills?.map((skill, sIdx) => {
          const isFound = candidate.matched_skills?.some(
            (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
          );
          const equivSource = candidate.equivalent_skills?.[skill];

          return (
            <div
              key={sIdx}
              className="flex items-center justify-between text-[13px] py-1.5 px-2.5 rounded-[6px] hover:bg-surface-alt/50 border border-line/60 transition-colors gap-2"
            >
              <span className="font-medium text-ink">{skill}</span>
              {isFound ? (
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink bg-champagne-soft px-2 py-0.5 rounded-[4px]">
                  <Check className="w-3.5 h-3.5 text-champagne" />
                  Found in resume
                </span>
              ) : equivSource ? (
                <span
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-ink bg-champagne-soft/70 px-2 py-0.5 rounded-[4px] border border-champagne/30"
                  title="Recognized as equivalent skill family with 75% credit"
                >
                  <Check className="w-3.5 h-3.5 text-champagne" />
                  Via {equivSource} (75%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[13px] text-ink-muted bg-surface-alt px-2 py-0.5 rounded-[4px] border border-dashed border-line">
                  <Minus className="w-3.5 h-3.5 text-ink-subtle" />
                  Missing
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
