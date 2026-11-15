import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Award, Crown } from 'lucide-react';
import MagneticButton from './MagneticButton';
import Reveal from './Reveal';

export default function HeroSection({ onEnterApp }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative pt-32 pb-36 md:pt-40 md:pb-44 bg-[#FBF7F2] overflow-hidden slant-bottom"
    >
      {/* Warm Ambient Radial Glow Behind Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F8ECEF] opacity-75 blur-3xl -z-10"
      />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            <Reveal staggerIndex={0}>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F7EDD8] border border-[#B8893B]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#B8893B]" />
                <span className="text-[11px] uppercase font-mono tracking-[0.14em] font-semibold text-[#8A6420]">
                  Explainable Resume Intelligence
                </span>
              </div>
            </Reveal>

            <Reveal staggerIndex={1}>
              <h1 className="text-[clamp(2.75rem,5.2vw,5rem)] font-serif font-bold text-[#2A1015] tracking-tight leading-[1.04]">
                Screen thousands of resumes with{' '}
                <span className="italic font-normal text-[#B8893B]">
                  Explainable
                </span>{' '}
                precision.
              </h1>
            </Reveal>

            <Reveal staggerIndex={2}>
              <p className="text-base sm:text-lg text-[#6B5A55] font-sans leading-relaxed max-w-xl">
                Replace opaque AI black-boxes with deterministic keyword coverage, vector TF-IDF contextual matching, and auditable mathematical scoring designed for senior talent partners.
              </p>
            </Reveal>

            <Reveal staggerIndex={3}>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <MagneticButton
                  variant="primary"
                  onClick={onEnterApp}
                  className="px-7 py-4 text-xs"
                >
                  Enter Studio
                </MagneticButton>

                <a href="#workflow">
                  <MagneticButton
                    variant="secondary"
                    showArrow={false}
                    className="px-6 py-4 text-xs"
                  >
                    Inspect Scoring Logic
                  </MagneticButton>
                </a>
              </div>
            </Reveal>

            {/* Quick Proof Stat Bar */}
            <Reveal staggerIndex={4}>
              <div className="pt-6 border-t border-[#E8DDD0] flex flex-wrap items-center gap-6 text-xs text-[#6B5A55] font-mono">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B8893B]" />
                  <span>100% Deterministic</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#B8893B]" />
                  <span>Zero LLM Hallucinations</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-[#B8893B]" />
                  <span>SHA-256 Deduplicated</span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Right Column: 3D Tilted Product Mockup with Drifting Parallax Chips */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            
            <div
              style={{
                perspective: '1200px',
              }}
              className="w-full max-w-[460px]"
            >
              {/* Main Tilted Card */}
              <div
                style={{
                  transform: reducedMotion
                    ? 'none'
                    : `rotateY(-8deg) rotateX(4deg) translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
                  transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-[0_20px_50px_rgba(42,16,21,0.12)] luxury-gold-top space-y-4"
              >
                {/* Mockup Card Header */}
                <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E8DDD0]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E8DDD0]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E8DDD0]" />
                    <span className="font-mono text-[10px] text-[#6B5A55] ml-2">
                      LEADERBOARD // SR. STAFF BACKEND
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8A6420] bg-[#F7EDD8] px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </div>

                {/* Candidate Rank Rows */}
                <div className="space-y-2.5">
                  
                  {/* Rank 1 - Highlighted */}
                  <div className="p-3 bg-[#F8ECEF] border border-[#7B1E3A]/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-[#F7EDD8] text-[#8A6420] font-mono font-bold text-xs flex items-center justify-center">
                        #1
                      </span>
                      <div>
                        <div className="font-serif font-bold text-sm text-[#2A1015]">
                          Elena Rostova
                        </div>
                        <div className="text-[10px] font-mono text-[#6B5A55]">
                          10/10 Mandatory Skills Verified
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#7B1E3A]">
                        94.6%
                      </div>
                      <span className="text-[9px] uppercase font-mono font-bold text-[#8A6420] bg-[#F7EDD8] px-1.5 py-0.5 rounded">
                        TOP TIER
                      </span>
                    </div>
                  </div>

                  {/* Rank 2 */}
                  <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl flex items-center justify-between hover:border-[#B8893B]/40 transition">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-[#F5EEE6] text-[#6B5A55] font-mono font-bold text-xs flex items-center justify-center">
                        #2
                      </span>
                      <div>
                        <div className="font-serif font-bold text-sm text-[#2A1015]">
                          Marcus Vance
                        </div>
                        <div className="text-[10px] font-mono text-[#6B5A55]">
                          9/10 Mandatory Skills
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#2A1015]">
                        88.2%
                      </div>
                      <span className="text-[9px] uppercase font-mono text-[#8A6420]">
                        QUALIFIED
                      </span>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-[#F5EEE6] text-[#6B5A55] font-mono font-bold text-xs flex items-center justify-center">
                        #3
                      </span>
                      <div>
                        <div className="font-serif font-bold text-sm text-[#2A1015]">
                          Sophia Chen
                        </div>
                        <div className="text-[10px] font-mono text-[#6B5A55]">
                          8/10 Mandatory Skills
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#6B5A55]">
                        79.4%
                      </div>
                      <span className="text-[9px] uppercase font-mono text-[#6B5A55]">
                        REVIEW
                      </span>
                    </div>
                  </div>

                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#6B5A55] font-mono border-t border-[#E8DDD0]">
                  <span>Hybrid Formula: TF-IDF + Token</span>
                  <span className="text-[#7B1E3A] font-semibold">1,248 Evaluated</span>
                </div>
              </div>

              {/* Floating Parallax Chip 1 (Top Left) */}
              <div
                style={{
                  transform: reducedMotion
                    ? 'none'
                    : `translate3d(${mouseOffset.x * -0.9}px, ${mouseOffset.y * -0.9}px, 40px)`,
                  transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -top-6 -left-6 bg-white border border-[#B8893B]/40 rounded-xl p-3 shadow-lg flex items-center space-x-2.5 z-20"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F7EDD8] flex items-center justify-center text-[#8A6420]">
                  <Crown className="w-4 h-4 text-[#B8893B]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#6B5A55]">Algorithmic Peak</div>
                  <div className="text-xs font-serif font-bold text-[#7B1E3A]">94.6% Top Match</div>
                </div>
              </div>

              {/* Floating Parallax Chip 2 (Top Right) */}
              <div
                style={{
                  transform: reducedMotion
                    ? 'none'
                    : `translate3d(${mouseOffset.x * 1.1}px, ${mouseOffset.y * 1.1}px, 30px)`,
                  transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -top-3 -right-6 bg-white border border-[#E8DDD0] rounded-xl p-3 shadow-lg flex items-center space-x-2.5 z-20"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F8ECEF] flex items-center justify-center text-[#7B1E3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#7B1E3A]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#6B5A55]">Coverage</div>
                  <div className="text-xs font-serif font-bold text-[#2A1015]">100% Mandatory</div>
                </div>
              </div>

              {/* Floating Parallax Chip 3 (Bottom Right) */}
              <div
                style={{
                  transform: reducedMotion
                    ? 'none'
                    : `translate3d(${mouseOffset.x * -0.7}px, ${mouseOffset.y * -0.7}px, 50px)`,
                  transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -bottom-6 -right-4 bg-white border border-[#B8893B]/40 rounded-xl p-3 shadow-lg flex items-center space-x-2.5 z-20"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F7EDD8] flex items-center justify-center text-[#8A6420]">
                  <ShieldCheck className="w-4 h-4 text-[#B8893B]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#6B5A55]">Audit Standard</div>
                  <div className="text-xs font-serif font-bold text-[#2A1015]">Zero Hallucination</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
