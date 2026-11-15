import { Check, Lock } from 'lucide-react';
import { Panel, ScoreBar, ScoreValue } from '../ui';

export default function ScoringFormulaSection() {
  const sampleRows = [
    {
      rank: 1,
      name: 'Sarah Jenkins',
      skillsPts: 58.0,
      textPts: 36.4,
      total: 94.4,
      verified: ['Python', 'FastAPI', 'PostgreSQL'],
    },
    {
      rank: 2,
      name: 'Alex Rivera',
      skillsPts: 52.0,
      textPts: 34.0,
      total: 86.0,
      verified: ['Python', 'FastAPI'],
    },
    {
      rank: 3,
      name: 'Jordan Lee',
      skillsPts: 48.0,
      textPts: 32.2,
      total: 80.2,
      verified: ['Python', 'Docker'],
    },
  ];

  return (
    <section id="scoring" className="py-24 sm:py-32 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Plain Explanation */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="text-[13px] font-medium text-ink-muted">Scoring methodology</div>
            <h2 className="text-[32px] sm:text-[38px] font-semibold text-ink tracking-tight leading-tight">
              Transparent, auditable math for every recommendation.
            </h2>
            <p className="text-[16px] text-ink-muted leading-relaxed">
              SmartATS replaces generative black-box guessing with deterministic formulas. Every
              candidate fit score is calculated from two verifiable signals:
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-[10px] border border-line bg-surface space-y-1">
                <div className="flex items-center justify-between text-[14px] font-medium text-ink">
                  <span>Skills covered</span>
                  <span className="font-semibold tabular-nums">60% weight</span>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  Deterministic verification of required technical competencies against resume
                  experience and projects.
                </p>
              </div>

              <div className="p-4 rounded-[10px] border border-line bg-surface space-y-1">
                <div className="flex items-center justify-between text-[14px] font-medium text-ink">
                  <span>Text match</span>
                  <span className="font-semibold tabular-nums">40% weight</span>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  TF-IDF vector cosine similarity analyzing contextual terminology and job
                  specification alignment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Real Leaderboard in Browser Frame */}
          <div className="lg:col-span-7">
            <Panel className="overflow-hidden shadow-xs">
              {/* Browser Header Bar */}
              <div className="px-4 py-3 bg-surface-alt border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-line" />
                  <div className="w-2.5 h-2.5 rounded-full bg-line" />
                  <div className="w-2.5 h-2.5 rounded-full bg-line" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-line rounded-[6px] text-[13px] text-ink-muted">
                  <Lock className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                  <span>smartats.app/studio/leaderboard</span>
                </div>
                <div className="w-6" />
              </div>

              {/* Leaderboard Table Mock */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line text-[13px] font-medium text-ink-muted">
                  <span>Rank & Candidate</span>
                  <span className="hidden sm:inline">Verified skills</span>
                  <span className="text-right">Final score</span>
                </div>

                <div className="space-y-3">
                  {sampleRows.map((row) => (
                    <div
                      key={row.rank}
                      className="p-3.5 rounded-[10px] border border-line bg-surface-alt/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center">
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
                            className="inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-[4px] bg-champagne-soft text-ink"
                          >
                            <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="w-32 text-right space-y-1">
                        <ScoreValue score={row.total} size="sm" />
                        <ScoreBar
                          skillsPoints={row.skillsPts}
                          textMatchPoints={row.textPts}
                          finalScore={row.total}
                          height="h-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
