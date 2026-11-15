import React, { useState } from 'react';
import {
  Fingerprint,
  Cpu,
  ShieldCheck,
  Scale,
  Sparkles,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import Reveal from './Reveal';

export default function BentoBenefits() {
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section id="benefits" className="py-24 md:py-32 bg-[#FBF7F2]">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <Reveal staggerIndex={0}>
            <span className="text-xs uppercase font-mono tracking-[0.14em] text-[#B8893B] font-semibold">
              Platform Architecture
            </span>
          </Reveal>
          <Reveal staggerIndex={1}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2A1015] tracking-tight leading-[1.1]">
              Engineered for verifiable, auditable recruitment decisions.
            </h2>
          </Reveal>
          <Reveal staggerIndex={2}>
            <p className="text-base text-[#6B5A55] font-sans">
              Unlike unpredictable prompt-based LLMs that invent qualifications, SmartATS pairs cryptographic integrity with explainable NLP algorithms.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(220px,auto)]">
          
          {/* Card 1: 2x2 Feature Card (Deduplication + Animated Hash + Cut-corner + Cursor Spotlight) */}
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsSpotlightActive(true)}
            onMouseLeave={() => setIsSpotlightActive(false)}
            className="md:col-span-2 md:row-span-2 relative bg-white border border-[#B8893B]/40 p-8 sm:p-10 cut-card shadow-[0_4px_20px_rgba(42,16,21,0.06)] hover:shadow-[0_12px_36px_rgba(123,30,58,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            {/* Cursor-following Spotlight */}
            {isSpotlightActive && (
              <div
                aria-hidden="true"
                style={{
                  background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(184, 137, 59, 0.12), transparent 70%)`,
                }}
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
              />
            )}

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
                  <Fingerprint className="w-6 h-6 text-[#B8893B]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A6420] bg-[#F7EDD8] px-2.5 py-1 rounded-full border border-[#B8893B]/30">
                  Cryptographic Proof
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1015]">
                  SHA-256 Binary Deduplication
                </h3>
                <p className="text-sm text-[#6B5A55] mt-2 font-sans leading-relaxed">
                  Every uploaded resume is hashed at the byte level prior to ingestion. Duplicate applications across agencies or job postings are flagged instantaneously with cryptographic certainty.
                </p>
              </div>

              {/* Animated Cryptographic Hash Illustration */}
              <div className="p-4 bg-[#FBF7F2] rounded-xl border border-[#E8DDD0] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#6B5A55] text-[10px]">
                  <span>RESUME_PAYLOAD.PDF</span>
                  <span className="text-[#8A6420] font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#B8893B] animate-pulse" />
                    <span>HASH_MATCH_ACTIVE</span>
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-[#E8DDD0] text-[11px] text-[#2A1015] break-all leading-tight font-semibold selection:bg-[#7B1E3A] selection:text-white">
                  sha256: 7b1e3a9a7230...b8893bf7edd8ecfdf5065f46
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-[#6B5A55]">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#B8893B]" />
                  <span>Validated against 150,000+ indexed candidate signatures</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-[#E8DDD0] flex items-center justify-between text-xs text-[#6B5A55] font-mono">
              <span>Collision Rate: 0.00%</span>
              <span className="text-[#7B1E3A] font-semibold">Zero Redundancy</span>
            </div>
          </div>

          {/* Card 2: 1x1 Feature Card (Vector TF-IDF Contextual Match) */}
          <div className="md:col-span-1 md:row-span-1 bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#B8893B]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
                <Cpu className="w-5 h-5 text-[#B8893B]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2A1015]">
                Vector TF-IDF Matching
              </h3>
              <p className="text-xs text-[#6B5A55] font-sans leading-relaxed">
                Evaluates semantic document depth beyond bare keyword counts, normalizing for resume length and frequency.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E8DDD0] text-[10px] font-mono text-[#8A6420]">
              L2 Norm Spherical Projection
            </div>
          </div>

          {/* Card 3: 1x1 Feature Card (Zero Hallucination) */}
          <div className="md:col-span-1 md:row-span-1 bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#B8893B]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
                <ShieldCheck className="w-5 h-5 text-[#B8893B]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2A1015]">
                Zero Hallucination
              </h3>
              <p className="text-xs text-[#6B5A55] font-sans leading-relaxed">
                Strict rule extraction prevents generative LLM fabrications, ensuring every scored competency exists in plain text.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E8DDD0] text-[10px] font-mono text-[#7B1E3A] font-semibold">
              100% Verifiable Text
            </div>
          </div>

          {/* Card 4: 2x1 Wide Card (Explainable Decision Scoring Matrix) */}
          <div className="md:col-span-2 md:row-span-1 bg-white border border-[#E8DDD0] rounded-2xl p-6 sm:p-8 shadow-xs hover:border-[#B8893B]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7EDD8] border border-[#B8893B]/30 flex items-center justify-center text-[#8A6420]">
                    <Scale className="w-5 h-5 text-[#B8893B]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#2A1015]">
                    Transparent Weighted Formula
                  </h3>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#7B1E3A] bg-[#F8ECEF] px-2.5 py-1 rounded-full border border-[#7B1E3A]/20">
                  AUDITABLE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Keyword Coverage Bar */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#FBF7F2] border border-[#E8DDD0]">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-semibold text-[#2A1015]">Mandatory Skills (60%)</span>
                    <span className="text-[#8A6420] font-bold">100% Verified</span>
                  </div>
                  <div className="w-full bg-[#E8DDD0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#7B1E3A] h-full rounded-full w-full" />
                  </div>
                </div>

                {/* Context Vector Bar */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#FBF7F2] border border-[#E8DDD0]">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-semibold text-[#2A1015]">Cosine Context (40%)</span>
                    <span className="text-[#8A6420] font-bold">86.5% TF-IDF</span>
                  </div>
                  <div className="w-full bg-[#E8DDD0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#B8893B] h-full rounded-full w-[86.5%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DDD0] flex items-center justify-between text-xs text-[#6B5A55] font-mono">
              <span>Final Score = 0.60 × Keywords + 0.40 × Vector</span>
              <span className="text-[#8A6420] font-semibold">94.6% Composite</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
