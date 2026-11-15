import { CheckCircle2, Minus } from 'lucide-react';
import { Badge } from '../../components/ui/Tag';

export default function ReviewSkillsTab({ candidate, activeJob }) {
  if (!candidate) return null;

  return (
    <div className="space-y-3">
      {(activeJob?.required_skills || []).map((req) => {
        const isMatched = (candidate.matched_skills || []).includes(req);
        const equivalent = candidate.equivalent_skills?.[req];

        return (
          <div
            key={req}
            className="p-3 rounded-[10px] border border-line bg-surface flex items-center justify-between text-[13px]"
          >
            <span className="font-medium text-ink">{req}</span>
            <div>
              {isMatched ? (
                <Badge variant="secondary" className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                  <span>Matched</span>
                </Badge>
              ) : equivalent ? (
                <Badge variant="champagne" className="flex items-center gap-1.5 font-medium">
                  <span>{equivalent} (Equiv · 75%)</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1.5 text-ink-subtle font-medium">
                  <Minus className="w-4 h-4" strokeWidth={1.75} />
                  <span>Missing</span>
                </Badge>
              )}
            </div>
          </div>
        );
      })}

      {candidate.preferred_matched_skills?.length > 0 && (
        <div className="pt-3 border-t border-line space-y-2">
          <span className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider">
            Preferred Skills Found
          </span>
          <div className="flex flex-wrap gap-1.5">
            {candidate.preferred_matched_skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
