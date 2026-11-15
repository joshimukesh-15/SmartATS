import React, { useState, useEffect, useRef } from 'react';
import { Lock, Search, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Reveal from './Reveal';

export default function ProductShowcase({ onEnterApp }) {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="showcase" className="py-24 md:py-36 bg-[#FBF7F2] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Reveal staggerIndex={0}>
            <span className="text-xs uppercase font-mono tracking-[0.14em] text-[#B8893B] font-semibold">
              Platform Interface
            </span>
          </Reveal>
          <Reveal staggerIndex={1}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2A1015] tracking-tight leading-[1.1]">
              The High-Density Screening Studio
            </h2>
          </Reveal>
          <Reveal staggerIndex={2}>
            <p className="text-base text-[#6B5A55] font-sans">
              Experience an ergonomic workstation tailored for talent partners handling high-volume senior engineering hires.
            </p>
          </Reveal>
        </div>

        {/* Large Browser-Frame Mockup with Inset Clip-path Reveal */}
        <div
          ref={containerRef}
          className={`reveal ${isInView ? 'in-view' : ''} bg-white border border-[#E8DDD0] rounded-2xl shadow-[0_24px_64px_rgba(42,16,21,0.12)] overflow-hidden`}
        >
          {/* Browser Chrome Header */}
          <div className="bg-[#F5EEE6] border-b border-[#E8DDD0] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#E8DDD0] border border-[#2A1015]/10" />
              <div className="w-3 h-3 rounded-full bg-[#E8DDD0] border border-[#2A1015]/10" />
              <div className="w-3 h-3 rounded-full bg-[#E8DDD0] border border-[#2A1015]/10" />
            </div>

            <div className="flex items-center space-x-2 bg-white/80 border border-[#E8DDD0] rounded-full px-4 py-1 text-xs font-mono text-[#6B5A55] w-full max-w-md justify-center shadow-xs">
              <Lock className="w-3 h-3 text-[#B8893B]" />
              <span className="truncate">https://app.smartats.internal/roles/backend-lead/leaderboard</span>
            </div>

            <button
              onClick={onEnterApp}
              className="text-xs font-mono font-semibold text-[#7B1E3A] hover:underline flex items-center space-x-1"
            >
              <span>Live App</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Studio Interface Mockup Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-white">
            
            {/* Top Stat Ribbon inside Browser */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#E8DDD0] pb-6">
              <div className="p-4 rounded-xl bg-[#FBF7F2] border border-[#E8DDD0]">
                <div className="text-[10px] uppercase font-mono text-[#6B5A55]">Indexed Applicants</div>
                <div className="text-2xl font-serif font-bold text-[#2A1015] mt-0.5">1,248 Candidates</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F8ECEF] border border-[#7B1E3A]/20">
                <div className="text-[10px] uppercase font-mono text-[#7B1E3A]">High-Tier Threshold</div>
                <div className="text-2xl font-serif font-bold text-[#7B1E3A] mt-0.5">≥ 80.0% Match</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30">
                <div className="text-[10px] uppercase font-mono text-[#8A6420]">SHA-256 Duplicates Caught</div>
                <div className="text-2xl font-serif font-bold text-[#8A6420] mt-0.5">42 Resumes (Clean)</div>
              </div>
            </div>

            {/* High Density Table View Mockup */}
            <div className="border border-[#E8DDD0] rounded-xl overflow-hidden shadow-xs">
              <div className="bg-[#FBF7F2] px-4 py-3 border-b border-[#E8DDD0] flex items-center justify-between text-xs font-mono font-semibold text-[#6B5A55]">
                <div className="flex items-center space-x-4">
                  <span>RANK</span>
                  <span>CANDIDATE</span>
                </div>
                <div className="flex items-center space-x-8">
                  <span className="hidden sm:inline">KEYWORDS (60%)</span>
                  <span className="hidden sm:inline">VECTOR (40%)</span>
                  <span>COMPOSITE SCORE</span>
                </div>
              </div>

              {/* Sample Rows */}
              <div className="divide-y divide-[#E8DDD0] text-xs">
                
                <div className="p-4 bg-[#F8ECEF]/40 flex items-center justify-between hover:bg-[#F8ECEF] transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="font-mono font-bold text-[#8A6420] bg-[#F7EDD8] px-2 py-0.5 rounded">#01</span>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#2A1015]">Elena Rostova</div>
                      <div className="text-[10px] font-mono text-[#6B5A55]">Python, FastAPI, Postgres, Docker, K8s</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 text-right font-mono">
                    <span className="hidden sm:inline text-[#8A6420] font-semibold">100.0%</span>
                    <span className="hidden sm:inline text-[#7B1E3A] font-semibold">86.5%</span>
                    <div className="w-28 text-right">
                      <div className="font-serif font-bold text-[#7B1E3A] text-sm">94.6%</div>
                      <div className="w-full bg-[#E8DDD0] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-[#7B1E3A] h-full w-[94.6%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white flex items-center justify-between hover:bg-[#FBF7F2] transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="font-mono font-semibold text-[#6B5A55] bg-[#F5EEE6] px-2 py-0.5 rounded">#02</span>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#2A1015]">Marcus Vance</div>
                      <div className="text-[10px] font-mono text-[#6B5A55]">FastAPI, Postgres, AWS, Redis, GraphQL</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 text-right font-mono">
                    <span className="hidden sm:inline text-[#8A6420] font-semibold">90.0%</span>
                    <span className="hidden sm:inline text-[#7B1E3A] font-semibold">85.5%</span>
                    <div className="w-28 text-right">
                      <div className="font-serif font-bold text-[#2A1015] text-sm">88.2%</div>
                      <div className="w-full bg-[#E8DDD0] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-[#B8893B] h-full w-[88.2%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white flex items-center justify-between hover:bg-[#FBF7F2] transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="font-mono font-semibold text-[#6B5A55] bg-[#F5EEE6] px-2 py-0.5 rounded">#03</span>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#2A1015]">Sophia Chen</div>
                      <div className="text-[10px] font-mono text-[#6B5A55]">Python, Docker, TypeScript, React</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 text-right font-mono">
                    <span className="hidden sm:inline text-[#8A6420] font-semibold">80.0%</span>
                    <span className="hidden sm:inline text-[#7B1E3A] font-semibold">78.5%</span>
                    <div className="w-28 text-right">
                      <div className="font-serif font-bold text-[#6B5A55] text-sm">79.4%</div>
                      <div className="w-full bg-[#E8DDD0] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-[#6B5A55] h-full w-[79.4%]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
