import { Check } from 'lucide-react';
import { ScoreValue, ScoreBar } from '../ui';
import { ProductFrame } from './ProductFrame';

export function FormulaLeaderboardPreview({ sampleRows }) {
  return (
    <div className="lg:col-span-7">
      <ProductFrame url="smartats.app/studio/leaderboard" className="shadow-xs">
        <div className="p-6 space-y-4 bg-surface">
          <div className="flex items-center justify-between pb-3 border-b border-line text-[13px] font-medium text-ink-muted">
            <span>Rank &amp; Candidate</span>
            <span className="hidden sm:inline">Verified skills</span>
            <span className="text-right">Final score</span>
          </div>

          <div className="space-y-3">
            {sampleRows.map((row) => (
              <div
                key={row.rank}
                className="p-3.5 rounded-[10px] border border-line bg-surface-alt/40 flex items-center justify-between gap-4 transition-colors hover:bg-surface-alt/60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center shrink-0">
                    {row.rank}
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-ink">{row.name}</div>
                    <div className="text-[13px] text-ink-muted">Verified application</div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5">
                  {row.verified.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-[6px] bg-surface-alt border border-line text-ink font-medium"
                    >
                      <Check className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.75} />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>

                <div className="w-32 text-right space-y-1 shrink-0">
                  <ScoreValue score={row.total} size="sm" />
                  <ScoreBar
                    skillsPoints={row.skillsPts}
                    textMatchPoints={row.textPts}
                    experiencePoints={row.expPts}
                    educationPoints={row.eduPts}
                    finalScore={row.total}
                    height="h-1.5"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-[8px] bg-surface-alt/50 border border-line text-[13px] text-ink-muted flex items-center justify-between">
            <span>Deterministic 4-Pillar Calculation</span>
            <span className="font-semibold text-ink tabular-nums">3 Candidates Scored</span>
          </div>
        </div>
      </ProductFrame>
      <figure className="mt-4 overflow-hidden rounded-[20px] border border-line bg-surface shadow-xs">
        <img
          src="/images/recruiter-desk.webp"
          alt="Hiring manager reviewing printed resumes at a tidy desk beside a window"
          width="1800"
          height="1200"
          loading="lazy"
          className="aspect-[3/2] w-full object-cover dark:brightness-[0.82]"
        />
        <figcaption className="border-t border-line px-4 py-3 text-[13px] text-ink-muted">
          Candidate evidence, reviewed with care.
        </figcaption>
      </figure>
    </div>
  );
}
