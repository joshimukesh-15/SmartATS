import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import Reveal from './Reveal';

export default function HeroSection({ onEnterApp }) {
  return (
    <section className="relative pt-36 sm:pt-44 lg:pt-48 pb-24 sm:pb-32 bg-canvas slant-bottom overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Left-Aligned Editorial Copy & Actions */}
          <div className="lg:col-span-6 space-y-8">
            
            <Reveal delay={0}>
              <h1 className="text-[clamp(3rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.02em] font-serif font-normal text-ink text-left">
                Know exactly why every candidate ranks where they do.
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-[18px] sm:text-[20px] text-ink-muted leading-[1.65] font-sans text-left max-w-xl">
                SmartATS scores resumes with transparent, auditable math: required skills, matched evidence and gaps, so every shortlist can be explained.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <button
                  onClick={onEnterApp}
                  className="px-7 py-3.5 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[16px] font-medium transition-colors shadow-xs"
                >
                  Open the studio
                </button>
                <a
                  href="#scoring"
                  className="inline-flex items-center space-x-2 text-[16px] font-medium text-ink hover:text-wine transition-colors group"
                >
                  <span>See how scoring works</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>

          </div>

          {/* Right Column: Real Product Leaderboard in Clean Browser Frame */}
          <div className="lg:col-span-6 lg:-mr-16 relative">
            <Reveal delay={150}>
              <div className="quiet-card shadow-[0_1px_2px_rgba(42,16,21,0.04),0_24px_64px_rgba(42,16,21,0.06)] overflow-hidden bg-surface border-line">
                
                {/* Browser Frame Chrome */}
                <div className="px-4 py-3 bg-surface-alt border-b border-line flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-line" />
                    <div className="w-2.5 h-2.5 rounded-full bg-line" />
                    <div className="w-2.5 h-2.5 rounded-full bg-line" />
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1 bg-surface border border-line rounded-[6px] text-[13px] font-mono text-ink-muted">
                    <Lock className="w-3 h-3 text-gold" />
                    <span>smartats.internal/lead-backend/rankings</span>
                  </div>
                  <div className="w-6" />
                </div>

                {/* Real Product UI Mockup */}
                <div className="p-6 space-y-4">
                  
                  {/* Table Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-line text-[13px] font-mono text-ink-muted uppercase tracking-[0.05em]">
                    <span>Candidate</span>
                    <span>Matched Skills</span>
                    <span className="text-right">Score</span>
                  </div>

                  {/* Candidate Row 1 - Rank #1 with very light wine tint */}
                  <div className="p-3.5 bg-wine-soft/40 rounded-[8px] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-ink text-[17px] font-normal">
                          Elena Rostova
                        </span>
                        <span className="text-[13px] font-mono text-wine font-medium">
                          #1
                        </span>
                      </div>
                      <div className="text-[13px] text-ink-muted font-sans">
                        Senior Distributed Systems Engineer
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface border border-line text-[13px] font-sans text-ink">
                        FastAPI
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface border border-line text-[13px] font-sans text-ink">
                        Python
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface border border-line text-[13px] font-sans text-ink">
                        Postgres
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono text-ink font-semibold text-[17px]">
                        94.6%
                      </span>
                      <div className="w-20 bg-line h-1 rounded-full overflow-hidden ml-auto">
                        <div className="bg-wine h-full w-[94.6%]" />
                      </div>
                    </div>
                  </div>

                  {/* Candidate Row 2 */}
                  <div className="p-3.5 bg-surface rounded-[8px] flex items-center justify-between border-b border-line/60">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-ink text-[17px] font-normal">
                          Marcus Vance
                        </span>
                        <span className="text-[13px] font-mono text-ink-muted">
                          #2
                        </span>
                      </div>
                      <div className="text-[13px] text-ink-muted font-sans">
                        Backend Infrastructure Engineer
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface-alt text-[13px] font-sans text-ink">
                        Python
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface-alt text-[13px] font-sans text-ink">
                        Docker
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface-alt text-[13px] font-sans text-ink">
                        AWS
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono text-ink font-semibold text-[17px]">
                        88.2%
                      </span>
                      <div className="w-20 bg-line h-1 rounded-full overflow-hidden ml-auto">
                        <div className="bg-gold h-full w-[88.2%]" />
                      </div>
                    </div>
                  </div>

                  {/* Candidate Row 3 */}
                  <div className="p-3.5 bg-surface rounded-[8px] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-ink text-[17px] font-normal">
                          Sophia Chen
                        </span>
                        <span className="text-[13px] font-mono text-ink-muted">
                          #3
                        </span>
                      </div>
                      <div className="text-[13px] text-ink-muted font-sans">
                        Full Stack Systems Engineer
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface-alt text-[13px] font-sans text-ink">
                        Python
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-surface-alt text-[13px] font-sans text-ink">
                        TypeScript
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono text-ink-muted font-semibold text-[17px]">
                        79.4%
                      </span>
                      <div className="w-20 bg-line h-1 rounded-full overflow-hidden ml-auto">
                        <div className="bg-ink-muted/50 h-full w-[79.4%]" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Bar inside Mockup */}
                <div className="px-6 py-3 bg-surface-alt border-t border-line flex items-center justify-between text-[13px] font-mono text-ink-muted">
                  <span>Evaluated via deterministic hybrid formula</span>
                  <span className="text-ink font-medium">100% auditable</span>
                </div>

              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
