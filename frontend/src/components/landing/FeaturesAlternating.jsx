import { Link } from 'react-router-dom';
import { Award, GitCompare, BarChart3, ArrowRight, Check, Minus, AlertCircle } from 'lucide-react';
import ProductFrame from './ProductFrame';
import { Avatar, ScoreBar, ScoreValue, Tag } from '../ui';
import { DEFAULT_WEIGHTS } from '../../lib/constants';

const weights = DEFAULT_WEIGHTS || {
  skills: 0.40,
  text: 0.20,
  experience: 0.25,
  education: 0.15,
};

export default function FeaturesAlternating() {
  return (
    <section
      id="features"
      className="py-[72px] lg:py-[128px] bg-canvas border-t border-line space-y-20 lg:space-y-32"
    >
      <div className="max-w-[1200px] mx-auto px-6 space-y-20 lg:space-y-32">
        {/* Row 1: Leaderboard Detail Panel (Text Left, Mock Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <Award className="w-4 h-4 text-champagne" strokeWidth={1.75} />
              <span>Master-detail leaderboard</span>
            </div>
            <h3 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
              Audit every score down to exact competencies.
            </h3>
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              Inspect each applicant with mathematical transparency across all 4 deterministic pillars:
              {` required skills (${Math.round(weights.skills * 100)}%), semantic text alignment (${Math.round(weights.text * 100)}%), experience fit (${Math.round(weights.experience * 100)}%), and education (${Math.round(weights.education * 100)}%). Every points breakdown is visible and defensible during engineering review.`}
            </p>
            <div className="pt-2">
              <Link
                to="/studio/leaderboard"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink hover:text-champagne transition-colors group select-none"
              >
                <span>Explore candidate rankings</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ProductFrame url="smartats.app/studio/leaderboard?candidate=c1">
              <div className="p-5 sm:p-6 space-y-5 bg-surface text-left">
                {/* Candidate Header */}
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div className="flex items-center gap-3">
                    <Avatar name="Sarah Jenkins" size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[17px] font-semibold text-ink leading-[1.35]">
                          Sarah Jenkins
                        </span>
                        <Tag tone="accent">Interview</Tag>
                      </div>
                      <div className="text-[13px] text-ink-muted">
                        Senior Backend Developer • 6 yrs exp
                      </div>
                    </div>
                  </div>
                  <ScoreValue score={94.6} size="lg" />
                </div>

                {/* Score Bar Breakdown (4 Pillars) */}
                <div className="space-y-1.5">
                  <ScoreBar
                    skillsPoints={38.0}
                    textMatchPoints={18.0}
                    experiencePoints={24.0}
                    educationPoints={14.6}
                    finalScore={94.6}
                    height="h-2.5"
                    showLabel={true}
                  />
                </div>

                {/* Breakdown Cards (4 Pillars) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                  <div className="p-3.5 rounded-[10px] bg-surface-alt border border-line space-y-1.5">
                    <div className="text-ink-muted font-medium">Skills ({Math.round(weights.skills * 100)}% wt)</div>
                    <div className="text-[17px] font-semibold text-ink tabular-nums leading-[1.35]">
                      95.0% <span className="text-[13px] font-normal text-ink-muted">(38.0 pts)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface text-ink text-[12px] border border-line">Python</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface text-ink text-[12px] border border-line">FastAPI</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface text-ink text-[12px] border border-line">PostgreSQL</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-surface-alt border border-line space-y-1.5">
                    <div className="text-ink-muted font-medium">Text ({Math.round(weights.text * 100)}% wt)</div>
                    <div className="text-[17px] font-semibold text-ink tabular-nums leading-[1.35]">
                      90.0% <span className="text-[13px] font-normal text-ink-muted">(18.0 pts)</span>
                    </div>
                    <p className="text-[12px] text-ink-muted pt-1 leading-snug">
                      High cosine similarity in distributed systems and pipelines.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-surface-alt border border-line space-y-1.5">
                    <div className="text-ink-muted font-medium">Exp ({Math.round(weights.experience * 100)}% wt)</div>
                    <div className="text-[17px] font-semibold text-ink tabular-nums leading-[1.35]">
                      96.0% <span className="text-[13px] font-normal text-ink-muted">(24.0 pts)</span>
                    </div>
                    <p className="text-[12px] text-ink-muted pt-1 leading-snug">
                      6 yrs verified experience meets Senior Backend threshold (5+ yrs).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-surface-alt border border-line space-y-1.5">
                    <div className="text-ink-muted font-medium">Edu ({Math.round(weights.education * 100)}% wt)</div>
                    <div className="text-[17px] font-semibold text-ink tabular-nums leading-[1.35]">
                      97.3% <span className="text-[13px] font-normal text-ink-muted">(14.6 pts)</span>
                    </div>
                    <p className="text-[12px] text-ink-muted pt-1 leading-snug">
                      B.S. in Computer Science verified from accredited institution.
                    </p>
                  </div>
                </div>
              </div>
            </ProductFrame>
          </div>
        </div>

        {/* Row 2: Compare Matrix (Mock Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <ProductFrame url="smartats.app/studio/compare?c=c1,c2">
              <div className="p-5 sm:p-6 bg-surface text-left">
                {/* Compare Matrix Table Header */}
                <div className="pb-3 border-b border-line flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink">Side-by-side competency matrix</span>
                  <span className="text-champagne font-medium tabular-nums">Diff filter: Active</span>
                </div>

                {/* Candidate Columns */}
                <div className="grid grid-cols-12 py-3 border-b border-line text-[13px] font-medium text-ink-muted">
                  <div className="col-span-6">Required Skill</div>
                  <div className="col-span-3 text-center">
                    <div className="font-semibold text-ink">Sarah Jenkins</div>
                    <div className="text-champagne tabular-nums">94.6 pts</div>
                  </div>
                  <div className="col-span-3 text-center">
                    <div className="font-semibold text-ink">Alex Rivera</div>
                    <div className="text-ink-muted tabular-nums">88.2 pts</div>
                  </div>
                </div>

                {/* Competency Rows */}
                <div className="divide-y divide-line text-[13px]">
                  <div className="grid grid-cols-12 py-2.5 items-center">
                    <span className="col-span-6 font-medium text-ink">Python & FastAPI</span>
                    <div className="col-span-3 flex justify-center text-ink font-medium">
                      <span className="inline-flex items-center gap-1 text-champagne"><Check className="w-4 h-4" strokeWidth={1.75} /> Found</span>
                    </div>
                    <div className="col-span-3 flex justify-center text-ink font-medium">
                      <span className="inline-flex items-center gap-1 text-champagne"><Check className="w-4 h-4" strokeWidth={1.75} /> Found</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-2.5 items-center">
                    <span className="col-span-6 font-medium text-ink">PostgreSQL</span>
                    <div className="col-span-3 flex justify-center text-ink font-medium">
                      <span className="inline-flex items-center gap-1 text-champagne"><Check className="w-4 h-4" strokeWidth={1.75} /> Found</span>
                    </div>
                    <div className="col-span-3 flex justify-center text-ink font-medium">
                      <span className="inline-flex items-center gap-1 text-champagne"><Check className="w-4 h-4" strokeWidth={1.75} /> Found</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-2.5 items-center bg-surface-alt/60 rounded-[6px]">
                    <span className="col-span-6 font-medium text-ink px-1.5">Kubernetes</span>
                    <div className="col-span-3 flex justify-center font-medium">
                      <span className="inline-flex items-center gap-1 text-ink-muted"><Minus className="w-4 h-4" strokeWidth={1.75} /> Missing</span>
                    </div>
                    <div className="col-span-3 flex justify-center font-medium">
                      <span className="inline-flex items-center gap-1 text-champagne"><Check className="w-4 h-4" strokeWidth={1.75} /> Found</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-2.5 items-center">
                    <span className="col-span-6 font-medium text-ink">Distributed Systems</span>
                    <div className="col-span-3 flex justify-center font-medium">
                      <span className="inline-flex items-center gap-1 text-champagne"><Check className="w-4 h-4" strokeWidth={1.75} /> Found</span>
                    </div>
                    <div className="col-span-3 flex justify-center font-medium">
                      <span className="inline-flex items-center gap-1 text-ink-muted"><Minus className="w-4 h-4" strokeWidth={1.75} /> Partial</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-[13px] text-ink-muted flex items-center justify-between">
                  <span>Showing 4 core competencies</span>
                  <span className="text-champagne font-medium tabular-nums">2 trade-off differences</span>
                </div>
              </div>
            </ProductFrame>
          </div>

          <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <GitCompare className="w-4 h-4 text-champagne" strokeWidth={1.75} />
              <span>Candidate comparison</span>
            </div>
            <h3 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
              Compare finalists with a side-by-side skill matrix.
            </h3>
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              Select shortlisted applicants to evaluate required technical competencies directly
              alongside each other. Filter down to differences only to highlight critical trade-offs
              before team debriefs.
            </p>
            <div className="pt-2">
              <Link
                to="/studio/compare"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink hover:text-champagne transition-colors group select-none"
              >
                <span>Compare candidate matrix</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 3: Analytics (Text Left, Mock Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <BarChart3 className="w-4 h-4 text-champagne" strokeWidth={1.75} />
              <span>Skill gap analytics</span>
            </div>
            <h3 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
              Spot talent pool strengths and pipeline gaps.
            </h3>
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              Analyze aggregate candidate data across positions to identify which required competencies
              are plentiful and which skills require adjusted sourcing criteria.
            </p>
            <div className="pt-2">
              <Link
                to="/studio/analytics"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink hover:text-champagne transition-colors group select-none"
              >
                <span>View pipeline analytics</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ProductFrame url="smartats.app/studio/analytics?role=senior-backend">
              <div className="p-5 sm:p-6 space-y-5 bg-surface text-left">
                {/* Metric Summary Strip */}
                <div className="grid grid-cols-3 gap-2 pb-4 border-b border-line text-[13px]">
                  <div>
                    <div className="text-ink-muted">Resumes Ingested</div>
                    <div className="text-[17px] font-semibold text-ink tabular-nums">42</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Average Score</div>
                    <div className="text-[17px] font-semibold text-champagne tabular-nums">78.4%</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Identified Gaps</div>
                    <div className="text-[17px] font-semibold text-ink tabular-nums flex items-center gap-1">
                      <span>1</span>
                      <AlertCircle className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>

                {/* Skill Coverage Bars */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium text-ink">Python</span>
                      <span className="text-ink-muted tabular-nums">93% (39/42)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-alt">
                      <div className="h-full bg-primary rounded-full w-[93%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium text-ink">FastAPI</span>
                      <span className="text-ink-muted tabular-nums">76% (32/42)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-alt">
                      <div className="h-full bg-primary rounded-full w-[76%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium text-ink">PostgreSQL</span>
                      <span className="text-ink-muted tabular-nums">71% (30/42)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-alt">
                      <div className="h-full bg-primary rounded-full w-[71%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-ink">Kubernetes</span>
                        <Tag tone="accent">Skill Gap</Tag>
                      </div>
                      <span className="text-champagne font-medium tabular-nums">24% (10/42)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-alt">
                      <div className="h-full bg-champagne rounded-full w-[24%]" />
                    </div>
                  </div>
                </div>
              </div>
            </ProductFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
