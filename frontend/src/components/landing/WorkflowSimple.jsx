import React from 'react';
import Reveal from './Reveal';

export default function WorkflowSimple() {
  const steps = [
    {
      num: '01',
      title: 'Multimodal Ingestion & Hash',
      description:
        'PDF and DOCX resumes are extracted via PyMuPDF with automated OCR fallback. A SHA-256 hash immediately stops redundant applicant evaluations.',
    },
    {
      num: '02',
      title: 'Dual-Track Evaluation',
      description:
        'The engine computes exact keyword coverage against mandatory criteria alongside length-normalized vector cosine similarity.',
    },
    {
      num: '03',
      title: 'Explainable Shortlist',
      description:
        'Candidates are ranked into verified tiers with granular evidence breakdowns ready for executive review or instant CSV export.',
    },
  ];

  return (
    <section className="py-24 sm:py-36 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <Reveal>
            <div className="text-[13px] font-mono tracking-[0.1em] text-ink-muted uppercase">
              Workflow
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] font-serif font-normal text-ink">
              Three deterministic stages.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[17px] sm:text-[18px] text-ink-muted leading-[1.65] font-sans">
              From raw binary upload to auditable candidate rank, every step executes predictably without stochastic generative drift.
            </p>
          </Reveal>
        </div>

        {/* 3 Numbered Steps with Thin Connecting Rule */}
        <div className="pt-6 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, idx) => (
            <Reveal key={step.num} delay={idx * 100}>
              <div className="space-y-4">
                <div className="font-serif text-5xl sm:text-6xl text-gold font-normal">
                  {step.num}
                </div>
                <h3 className="font-serif text-2xl text-ink font-normal">
                  {step.title}
                </h3>
                <p className="text-[15px] text-ink-muted font-sans leading-[1.6]">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
