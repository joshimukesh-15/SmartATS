import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Cpu, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function WorkflowSticky() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = rect.height - windowHeight;
      if (totalDist <= 0) return;
      const current = Math.min(Math.max(-rect.top / totalDist, 0), 1);
      setScrollProgress(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Multimodal Ingestion & Fingerprinting',
      badge: 'INGESTION ENGINE',
      description:
        'Upload PDF and DOCX files in batch. PyMuPDF directly extracts high-fidelity text streams; scanned graphics trigger automated Tesseract OCR. A SHA-256 hash is computed immediately to eliminate redundant recruiter processing.',
      metrics: ['SHA-256 Duplication Filter', 'OCR Scanned Document Fallback', '15MB Document Limit'],
    },
    {
      num: '02',
      title: 'Dual-Track Mathematical Scoring',
      badge: 'TF-IDF + KEYWORD COVERAGE',
      description:
        'Resumes are evaluated across two complementary dimensions: strict mandatory keyword coverage (0–100%) and Euclidean L2-normalized vector TF-IDF cosine similarity. Both vectors project onto a unit sphere for bias-free comparative scoring.',
      metrics: ['60% Mandatory Skill Weight', '40% Contextual Vector Similarity', 'Zero Arbitrary Point Penalties'],
    },
    {
      num: '03',
      title: 'Differential Matrix & Auditable Ranking',
      badge: 'DECISION MATRIX',
      description:
        'Candidates are categorized into verified tiers (High, Mid, Low) with complete skill-gap breakdowns. Compare top applicants side-by-side on an interactive competency matrix or export data for senior executive review.',
      metrics: ['Tiered Score Badges', 'Side-by-Side Comparison Matrix', 'Auditable Score Explanations'],
    },
  ];

  return (
    <section
      id="workflow"
      ref={containerRef}
      className="py-24 md:py-36 bg-[#FBF7F2] border-t border-[#E8DDD0]"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Sticky Heading & Progress Line */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <Reveal staggerIndex={0}>
              <span className="text-xs uppercase font-mono tracking-[0.14em] text-[#B8893B] font-semibold">
                Transparent Execution
              </span>
            </Reveal>

            <Reveal staggerIndex={1}>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2A1015] tracking-tight leading-[1.1]">
                Deterministic screening across three transparent stages.
              </h2>
            </Reveal>

            <Reveal staggerIndex={2}>
              <p className="text-base text-[#6B5A55] font-sans leading-relaxed">
                No black-box hallucinations. Every candidate score can be mathematically justified to hiring managers and executive talent committees.
              </p>
            </Reveal>

            {/* Vertical Progress Track */}
            <div className="hidden lg:flex items-center space-x-4 pt-4">
              <div className="relative w-1 h-36 bg-[#E8DDD0] rounded-full overflow-hidden">
                <div
                  style={{ height: `${scrollProgress * 100}%` }}
                  className="w-full bg-[#B8893B] transition-all duration-150 ease-out"
                />
              </div>
              <div className="space-y-8 text-xs font-mono">
                <div
                  className={`transition-colors duration-200 ${
                    scrollProgress < 0.35 ? 'text-[#7B1E3A] font-bold' : 'text-[#6B5A55]'
                  }`}
                >
                  Stage 01 — Ingestion
                </div>
                <div
                  className={`transition-colors duration-200 ${
                    scrollProgress >= 0.35 && scrollProgress < 0.7
                      ? 'text-[#7B1E3A] font-bold'
                      : 'text-[#6B5A55]'
                  }`}
                >
                  Stage 02 — Dual Scoring
                </div>
                <div
                  className={`transition-colors duration-200 ${
                    scrollProgress >= 0.7 ? 'text-[#7B1E3A] font-bold' : 'text-[#6B5A55]'
                  }`}
                >
                  Stage 03 — Matrix Ranking
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Three Tall Step Panels with Giant Numeral Watermark */}
          <div className="lg:col-span-7 space-y-10">
            {steps.map((step, idx) => (
              <Reveal key={step.num} staggerIndex={idx}>
                <div className="relative bg-white border border-[#E8DDD0] rounded-2xl p-8 sm:p-10 shadow-xs hover:shadow-[0_12px_32px_rgba(123,30,58,0.08)] hover:border-[#B8893B]/40 transition-all duration-300 overflow-hidden">
                  
                  {/* Giant Gold Serif Numeral Watermark */}
                  <span
                    aria-hidden="true"
                    className="font-serif text-[120px] sm:text-[150px] font-bold text-[#B8893B] opacity-10 absolute -top-8 -right-2 pointer-events-none select-none leading-none z-0"
                  >
                    {step.num}
                  </span>

                  <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F7EDD8] border border-[#B8893B]/30 text-[#8A6420] text-[10px] font-mono font-semibold tracking-wider">
                      <span>STAGE {step.num} // {step.badge}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1015]">
                      {step.title}
                    </h3>

                    <p className="text-sm text-[#6B5A55] font-sans leading-relaxed">
                      {step.description}
                    </p>

                    <div className="pt-4 border-t border-[#E8DDD0] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-[#2A1015]">
                      {step.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B8893B] flex-shrink-0" />
                          <span className="truncate">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
