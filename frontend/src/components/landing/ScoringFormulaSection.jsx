import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import Reveal from './Reveal';

export default function ScoringFormulaSection() {
  const sectionRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="scoring" ref={sectionRef} className="py-24 sm:py-36 bg-canvas">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <Reveal>
            <div className="text-[13px] font-mono tracking-[0.1em] text-ink-muted uppercase">
              Scoring Methodology
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] font-serif font-normal text-ink">
              The math is the justification.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[17px] sm:text-[18px] text-ink-muted leading-[1.65] font-sans">
              Instead of unprompted black-box rankings, SmartATS combines verified keyword verification for mandatory skills with document-level text similarity. Every candidate’s rank can be explained in plain terms.
            </p>
          </Reveal>
        </div>

        {/* Signature Interactive Formula Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Stacked Animated Score Bars */}
          <div className="lg:col-span-7 quiet-card p-8 sm:p-10 space-y-8 bg-surface">
            
            <div className="flex items-center justify-between pb-6 border-b border-line">
              <div>
                <span className="text-[13px] font-mono text-ink-muted uppercase">Formula Breakdown</span>
                <div className="font-serif text-2xl text-ink font-normal mt-0.5">
                  Final Composite = (0.60 × Skills) + (0.40 × Similarity)
                </div>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-mono text-ink-muted">Calculated Score</span>
                <div className="font-mono text-3xl font-semibold text-ink">94.6%</div>
              </div>
            </div>

            {/* Bar 1: Required Skills Coverage (60%) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-sans font-medium text-ink">
                  Required Skill Coverage (60% Weight)
                </span>
                <span className="font-mono font-semibold text-wine">
                  100.0% Coverage
                </span>
              </div>
              <div className="w-full bg-surface-alt h-3 rounded-full overflow-hidden border border-line">
                <div
                  style={{
                    width: animated ? '100%' : '0%',
                    transition: 'width 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="bg-wine h-full rounded-full"
                />
              </div>
              <p className="text-[13px] font-sans text-ink-muted">
                Evaluates every mandatory skill explicitly stated in the job specification. All 5 required skills confirmed in document text.
              </p>
            </div>

            {/* Bar 2: Contextual Document Similarity (40%) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-sans font-medium text-ink">
                  Contextual Document Similarity (40% Weight)
                </span>
                <span className="font-mono font-semibold text-ink">
                  86.5% TF-IDF Cosine
                </span>
              </div>
              <div className="w-full bg-surface-alt h-3 rounded-full overflow-hidden border border-line">
                <div
                  style={{
                    width: animated ? '86.5%' : '0%',
                    transition: 'width 1000ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
                  }}
                  className="bg-ink-muted h-full rounded-full"
                />
              </div>
              <p className="text-[13px] font-sans text-ink-muted">
                Lexical TF-IDF vectorization across unigrams and bigrams, Euclidean L2 normalized to eliminate unfair bias toward long resumes.
              </p>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between text-[13px] font-mono text-ink-muted">
              <span>Elena Rostova (Candidate Dossier #1042)</span>
              <span className="text-ink font-medium">Verified by deterministic parser</span>
            </div>

          </div>

          {/* Right Column: Skill-by-Skill Matched/Missing List */}
          <div className="lg:col-span-5 space-y-6">
            <div className="quiet-card p-8 bg-surface space-y-6">
              
              <div>
                <h3 className="font-serif text-2xl text-ink font-normal">
                  Skill-by-Skill Evidence
                </h3>
                <p className="text-[13px] text-ink-muted font-sans mt-1">
                  Exact verification records matched against the target specification.
                </p>
              </div>

              {/* Matched Mandatory Skills */}
              <div className="space-y-3">
                <div className="text-[13px] font-mono uppercase text-ink-muted flex items-center justify-between">
                  <span>Mandatory Requirements</span>
                  <span className="text-wine font-medium">5/5 Matched</span>
                </div>
                <div className="space-y-2">
                  {['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'].map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between p-2.5 rounded-[8px] bg-surface-alt text-[14px]"
                    >
                      <span className="font-sans text-ink font-medium">{skill}</span>
                      <span className="inline-flex items-center space-x-1 font-mono text-[13px] text-wine">
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmed</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Qualifications */}
              <div className="space-y-3 pt-2 border-t border-line">
                <div className="text-[13px] font-mono uppercase text-ink-muted flex items-center justify-between">
                  <span>Preferred Qualifications</span>
                  <span className="text-ink font-medium">2 Verified</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-surface-alt rounded-[8px] text-[13px] font-sans text-ink">
                    + Redis
                  </span>
                  <span className="px-3 py-1 bg-surface-alt rounded-[8px] text-[13px] font-sans text-ink">
                    + Kubernetes
                  </span>
                </div>
              </div>

              {/* Gaps */}
              <div className="pt-2 border-t border-line text-[13px] font-sans text-ink-muted flex items-center justify-between">
                <span>Critical Competency Gaps</span>
                <span className="font-medium text-ink">0 Missing Skills</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
