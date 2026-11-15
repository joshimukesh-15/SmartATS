import React from 'react';
import { Check, X } from 'lucide-react';
import Reveal from './Reveal';

export default function FeaturesAlternating() {
  return (
    <section id="features" className="py-24 sm:py-36 bg-canvas border-t border-line space-y-28 sm:space-y-36">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-28 sm:space-y-36">
        
        {/* Row 1: Candidate Leaderboard (Text Left, Screenshot Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <div className="text-[13px] font-mono tracking-[0.1em] text-ink-muted uppercase">
                01 // Shortlisting
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] font-serif font-normal text-ink">
                Rankings that leave zero room for ambiguity.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[17px] text-ink-muted leading-[1.65] font-sans">
                Every applicant is indexed with granular keyword coverage, contextual similarity, and explicit skill verification. Tier boundaries (High, Mid, Low) ensure hiring committees align quickly on who to advance.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="quiet-card bg-surface overflow-hidden p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-line text-[13px] font-mono text-ink-muted">
                  <span>ROLE: SR. BACKEND ENGINEER</span>
                  <span>1,248 APPLICANTS INDEXED</span>
                </div>
                
                <div className="divide-y divide-line text-[14px]">
                  <div className="py-3.5 flex items-center justify-between bg-wine-soft/30 px-3 rounded-[8px]">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-wine font-semibold text-[13px]">#01</span>
                      <span className="font-serif text-ink text-[17px]">Elena Rostova</span>
                    </div>
                    <div className="flex items-center space-x-6 font-mono text-[13px]">
                      <span className="text-ink-muted">100% Skills</span>
                      <span className="font-semibold text-wine text-[16px]">94.6%</span>
                    </div>
                  </div>

                  <div className="py-3.5 flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-ink-muted text-[13px]">#02</span>
                      <span className="font-serif text-ink text-[17px]">Marcus Vance</span>
                    </div>
                    <div className="flex items-center space-x-6 font-mono text-[13px]">
                      <span className="text-ink-muted">90% Skills</span>
                      <span className="font-semibold text-ink text-[16px]">88.2%</span>
                    </div>
                  </div>

                  <div className="py-3.5 flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-ink-muted text-[13px]">#03</span>
                      <span className="font-serif text-ink text-[17px]">Sophia Chen</span>
                    </div>
                    <div className="flex items-center space-x-6 font-mono text-[13px]">
                      <span className="text-ink-muted">80% Skills</span>
                      <span className="font-semibold text-ink-muted text-[16px]">79.4%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[13px] font-mono text-ink-muted">
                  <span>Export: CSV dossier available</span>
                  <span className="text-ink">Instant committee review</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Row 2: Differential Compare Matrix (Screenshot Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Reveal delay={120}>
              <div className="quiet-card bg-surface overflow-hidden p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-line text-[13px] font-mono text-ink-muted">
                  <span>COMPETENCY ALIGNMENT MATRIX</span>
                  <span>2 PROFILES COMPARED</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-line font-mono text-ink-muted">
                        <th className="pb-3 font-normal">Requirement</th>
                        <th className="pb-3 text-center font-normal">Elena (94.6%)</th>
                        <th className="pb-3 text-center font-normal">Marcus (88.2%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      <tr>
                        <td className="py-3 font-medium text-ink">FastAPI Architecture</td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-ink">PostgreSQL Optimization</td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-ink">Docker & Containers</td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="py-3 text-center text-ink-muted"><X className="w-4 h-4 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-ink">Kubernetes Clustering</td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                        <td className="py-3 text-center text-wine"><Check className="w-4 h-4 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 text-[13px] font-mono text-ink-muted">
                  Winner column identified by composite scoring threshold
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <Reveal>
              <div className="text-[13px] font-mono tracking-[0.1em] text-ink-muted uppercase">
                02 // Comparison
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] font-serif font-normal text-ink">
                Direct differential analysis between finalists.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[17px] text-ink-muted leading-[1.65] font-sans">
                Select any two to five candidates to evaluate them side-by-side on an objective skill matrix. Inspect shared technical competencies and identify missing requirements without opening five separate PDF tabs.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Row 3: Diagnostics & Analytics (Text Left, Screenshot Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <div className="text-[13px] font-mono tracking-[0.1em] text-ink-muted uppercase">
                03 // Intelligence
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] font-serif font-normal text-ink">
                Platform analytics that spot pipeline bottlenecks.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[17px] text-ink-muted leading-[1.65] font-sans">
                Audit aggregate candidate quality across job openings. Track the most frequently matched competencies, pinpoint common skill shortages, and monitor duplicate submission rates via cryptographic binary validation.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="quiet-card bg-surface overflow-hidden p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-line text-[13px] font-mono text-ink-muted">
                  <span>SCREENING DIAGNOSTICS</span>
                  <span>AGGREGATE TALENT POOL</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-sans font-medium text-ink">Python (Core Language)</span>
                      <span className="font-mono text-ink-muted">92% of Applicants</span>
                    </div>
                    <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-line">
                      <div className="bg-wine h-full w-[92%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-sans font-medium text-ink">FastAPI / Async REST</span>
                      <span className="font-mono text-ink-muted">74% of Applicants</span>
                    </div>
                    <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-line">
                      <div className="bg-wine h-full w-[74%]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-sans font-medium text-ink">Distributed Systems Architecture</span>
                      <span className="font-mono text-ink-muted">38% of Applicants (Frequent Gap)</span>
                    </div>
                    <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-line">
                      <div className="bg-ink-muted/50 h-full w-[38%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[13px] font-mono text-ink-muted border-t border-line">
                  <span>SHA-256 Duplication Filter Active</span>
                  <span className="text-ink font-medium">0.0% Redundancy</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}
