import { Check, Minus } from 'lucide-react';

export default function CandidateSkillsTab({ candidate, activeJob }) {
  if (!candidate) return null;

  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between text-[13px] text-ink-muted pb-2 border-b border-line font-medium">
        <span>Skill Requirement</span>
        <span>Candidate Evidence</span>
      </div>
      <div className="space-y-2">
        {activeJob?.required_skills?.map((skill, sIdx) => {
          const isFound = candidate.matched_skills?.some(
            (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
          );
          const equivSource = candidate.equivalent_skills?.[skill];

          return (
            <div
              key={sIdx}
              className="flex items-center justify-between text-[13px] py-2 px-3 rounded-[8px] hover:bg-surface-alt/50 border border-line/60 transition-colors gap-2"
            >
              <span className="font-medium text-ink">{skill}</span>
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
                  <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                  Via {equivSource} (75%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted bg-surface-alt px-2.5 py-0.5 rounded-[6px] border border-dashed border-line font-medium">
                  <Minus className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
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
