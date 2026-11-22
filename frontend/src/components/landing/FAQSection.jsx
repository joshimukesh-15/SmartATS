import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../../lib/constants';

const weights = DEFAULT_WEIGHTS || {
  skills: 0.40,
  text: 0.20,
  experience: 0.25,
  education: 0.15,
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does SmartATS calculate candidate scores?',
      a: `Scores are generated using a deterministic 4-pillar formula: ${Math.round(weights.skills * 100)}% Required Skills coverage from verified experience, ${Math.round(weights.text * 100)}% Semantic Text Alignment (TF-IDF vector cosine similarity), ${Math.round(weights.experience * 100)}% Experience Fit against seniority requirements, and ${Math.round(weights.education * 100)}% Education and credential verification. Recruiter weights can also be customized per job opening.`,
    },
    {
      q: 'Does SmartATS use black-box generative AI to rank resumes?',
      a: 'No. SmartATS intentionally avoids LLM hallucinations and black-box scoring. Every recommendation is auditable and backed by mathematical evidence that can be shown directly to engineering hiring managers.',
    },
    {
      q: 'How does duplicate resume detection operate?',
      a: 'When an applicant file is uploaded, SmartATS immediately calculates its SHA-256 cryptographic hash. If the identical file has previously been submitted by another agency or source, it is flagged and skipped without redundant reprocessing.',
    },
    {
      q: 'What resume file formats are supported?',
      a: 'Native PDF files (via PyMuPDF) and Microsoft Word documents (.docx via python-docx) are parsed directly. Scanned documents automatically use OCR fallback when text density is low.',
    },
    {
      q: 'Can rankings be exported for team review?',
      a: 'Yes. Complete leaderboards and evaluation data can be exported as structured CSV files with one click, or formatted for print and PDF reporting.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section id="faq" className="py-[72px] lg:py-[128px] bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (Sticky Heading) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4 text-left">
            <div className="text-[13px] font-medium text-ink-muted">
              Common questions
            </div>
            <h2 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
              Frequently asked questions
            </h2>
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              Everything you need to know about our deterministic resume evaluation engine,
              mathematical scoring formula, and data privacy.
            </p>
          </div>

          {/* Right Column: Accessible Accordion with Hairline Dividers */}
          <div className="lg:col-span-7 text-left">
            <div className="border-t border-line">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className="group">
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                      className="w-full py-5 flex items-center justify-between gap-4 text-left font-medium text-[16px] text-ink hover:text-primary transition-colors cursor-pointer select-none"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-250 ease-out ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                        strokeWidth={1.75}
                      />
                    </button>

                    {/* Smooth 250ms Height Transition */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-250 ease-out overflow-hidden ${
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 pr-8 text-[15px] leading-[1.6] text-ink-muted">
                          {faq.a}
                        </p>
                      </div>
                    </div>

                    {/* Hairline Divider */}
                    <div className="hairline-divider" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
