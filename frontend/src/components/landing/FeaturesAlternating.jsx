import { Check, Minus, GitCompare, BarChart3, Award } from 'lucide-react';
import { Panel, ScoreBar, ScoreValue } from '../ui';

export default function FeaturesAlternating() {
  return (
    <section
      id="features"
      className="py-24 sm:py-32 bg-canvas border-t border-line space-y-24 sm:space-y-32"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-24 sm:space-y-32">
        {/* Row 1: Leaderboard (Text Left, Mock Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <Award className="w-4 h-4 text-champagne" strokeWidth={1.75} />
              <span>Master-detail leaderboard</span>
            </div>
            <h3 className="text-[28px] sm:text-[34px] font-semibold text-ink tracking-tight leading-tight">
              Audit every score down to exact competencies.
            </h3>
            <p className="text-[16px] text-ink-muted leading-relaxed">
              Recruiters can inspect each applicant with full mathematical transparency. See exactly
              which skills contributed points, which are missing, and how text similarity was
              calculated.
            </p>
          </div>

          <div className="lg:col-span-7">
            <Panel className="p-6 space-y-4 bg-surface shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div>
                  <div className="text-[15px] font-semibold text-ink">Sarah Jenkins</div>
                  <div className="text-[13px] text-ink-muted">Senior Backend Developer</div>
                </div>
                <ScoreValue score={94.6} size="lg" />
              </div>
              <ScoreBar
                skillsPoints={58.0}
                textMatchPoints={36.6}
                finalScore={94.6}
                height="h-2"
                showLabel={true}
              />
              <div className="grid grid-cols-2 gap-2 pt-2 text-[13px]">
                <div className="p-3 rounded-[8px] bg-surface-alt border border-line">
                  <div className="text-ink-muted">Skills covered</div>
                  <div className="text-[16px] font-semibold text-ink">96.7% (58.0 pts)</div>
                </div>
                <div className="p-3 rounded-[8px] bg-surface-alt border border-line">
                  <div className="text-ink-muted">Text match</div>
                  <div className="text-[16px] font-semibold text-ink">91.5% (36.6 pts)</div>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Row 2: Compare Matrix (Mock Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Panel className="p-6 bg-surface shadow-xs overflow-hidden">
              <div className="text-[13px] font-medium text-ink pb-3 border-b border-line flex justify-between">
                <span>Side-by-side competency matrix</span>
                <span className="text-champagne font-semibold">Leading: Sarah Jenkins</span>
              </div>
              <div className="divide-y divide-line pt-2 text-[13px]">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-ink">Python & FastAPI</span>
                  <div className="flex gap-8">
                    <span className="text-ink flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} /> Found
                    </span>
                    <span className="text-ink flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} /> Found
                    </span>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-ink">PostgreSQL</span>
                  <div className="flex gap-8">
                    <span className="text-ink flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} /> Found
                    </span>
                    <span className="text-ink-muted flex items-center gap-1 font-medium">
                      <Minus className="w-4 h-4" strokeWidth={1.75} /> Missing
                    </span>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-ink">Docker & Kubernetes</span>
                  <div className="flex gap-8">
                    <span className="text-ink flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} /> Found
                    </span>
                    <span className="text-ink flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4 text-champagne" strokeWidth={1.75} /> Found
                    </span>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <GitCompare className="w-4 h-4 text-champagne" strokeWidth={1.75} />
              <span>Candidate comparison</span>
            </div>
            <h3 className="text-[28px] sm:text-[34px] font-semibold text-ink tracking-tight leading-tight">
              Compare finalists with a side-by-side skill matrix.
            </h3>
            <p className="text-[16px] text-ink-muted leading-relaxed">
              Select 2 to 5 shortlisted applicants to compare required technical qualifications side
              by side. Toggle to display differences only, highlighting exact trade-offs.
            </p>
          </div>
        </div>

        {/* Row 3: Analytics (Text Left, Mock Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <BarChart3 className="w-4 h-4 text-champagne" strokeWidth={1.75} />
              <span>Skill gap analytics</span>
            </div>
            <h3 className="text-[28px] sm:text-[34px] font-semibold text-ink tracking-tight leading-tight">
              Spot talent pool strengths and pipeline gaps.
            </h3>
            <p className="text-[16px] text-ink-muted leading-relaxed">
              Analyze aggregate candidate data across positions to identify which required
              competencies are plentiful and which skills require adjusted sourcing criteria.
            </p>
          </div>

          <div className="lg:col-span-7">
            <Panel className="p-6 space-y-4 bg-surface shadow-xs">
              <div className="text-[14px] font-semibold text-ink">
                Verified skills coverage rate
              </div>
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium text-ink">Python</span>
                    <span className="text-ink-muted tabular-nums">83%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-alt">
                    <div className="h-full bg-primary rounded-full w-[83%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium text-ink">FastAPI</span>
                    <span className="text-ink-muted tabular-nums">67%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-alt">
                    <div className="h-full bg-primary rounded-full w-[67%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium text-ink">Kubernetes (Common gap)</span>
                    <span className="text-ink-muted tabular-nums">33%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-alt">
                    <div className="h-full bg-champagne rounded-full w-[33%]" />
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
