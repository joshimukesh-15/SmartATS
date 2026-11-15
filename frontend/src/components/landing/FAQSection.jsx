import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Reveal from './Reveal';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does SmartATS ensure rankings are auditable?',
      a: 'Rankings are governed by a mathematical equation rather than generative prompts. Every candidate score decomposes cleanly into exact keyword coverage of mandatory criteria (60%) and normalized text similarity (40%), with direct citations to document text.',
    },
    {
      q: 'What resume document formats are supported?',
      a: 'SmartATS extracts both PDF and DOCX files up to 15MB. The ingestion pipeline uses PyMuPDF for high-speed vector stream text extraction and triggers an automated Tesseract OCR engine for scanned image resumes.',
    },
    {
      q: 'How does duplicate detection operate?',
      a: 'During upload, a SHA-256 binary hash is computed from the raw file payload. If an identical file is uploaded by another team member or recruiting agency, it is identified immediately without redundant reprocessing.',
    },
    {
      q: 'Can the 60% / 40% scoring formula weights be audited?',
      a: 'Yes. Every candidate card in the studio provides a transparent breakdown of matched mandatory skills, preferred bonus qualifications, and contextual document depth.',
    },
    {
      q: 'Is candidate data stored locally or shared with external models?',
      a: 'Candidate resumes are parsed and indexed entirely within your private database. No document text or personal candidate data is transmitted to third-party generative foundation models.',
    },
  ];

  return (
    <section id="faq" className="py-24 sm:py-36 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Contact */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <div className="text-[13px] font-mono tracking-[0.1em] text-ink-muted uppercase">
                FAQ
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] font-serif font-normal text-ink">
                Questions & Specifications
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[17px] text-ink-muted leading-[1.65] font-sans">
                For compliance guidelines, on-premises deployment, or algorithmic adjustments, get in touch with our team.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <a
                href="mailto:engineering@smartats.internal"
                className="inline-block text-[15px] font-medium text-ink hover:text-wine transition-colors border-b border-ink/30 pb-0.5"
              >
                engineering@smartats.internal
              </a>
            </Reveal>
          </div>

          {/* Right Column: Clean Accordion with Plus Icon & Hairlines */}
          <div className="lg:col-span-7 divide-y divide-line border-t border-b border-line">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left space-x-6 cursor-pointer focus:outline-none group"
                  >
                    <span className="font-serif text-xl sm:text-2xl text-ink font-normal group-hover:text-wine transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`text-ink-muted transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-45 text-wine' : ''
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[15px] text-ink-muted font-sans leading-[1.65]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
