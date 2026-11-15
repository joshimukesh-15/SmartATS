import React from 'react';
import Reveal from './Reveal';

export default function ProofStrip() {
  const metrics = [
    {
      value: '98.8%',
      label: 'Skill Extraction F1-Score',
      caption: 'Evaluated across 150+ labeled resumes with 97.7% precision and 100% recall.',
    },
    {
      value: '1.00',
      label: 'Precision@1 on Benchmark Sets',
      caption: 'The highest-ranked applicant consistently satisfies 100% of required technical criteria.',
    },
    {
      value: '3.85 ms',
      label: 'Average Extraction Latency',
      caption: 'Native PyMuPDF vector stream parsing with automated Tesseract OCR fallback.',
    },
  ];

  return (
    <section id="evidence" className="py-16 sm:py-24 bg-canvas border-y border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {metrics.map((item, idx) => (
            <Reveal key={idx} delay={idx * 80}>
              <div className="space-y-3">
                <div className="font-serif text-5xl sm:text-6xl text-ink tracking-tight font-normal">
                  {item.value}
                </div>
                <div className="text-[15px] font-sans font-medium text-ink">
                  {item.label}
                </div>
                <p className="text-[13px] font-sans text-ink-muted leading-[1.6]">
                  {item.caption}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
