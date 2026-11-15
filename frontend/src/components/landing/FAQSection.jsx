import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does SmartATS calculate candidate scores?',
      a: 'Scores are generated using a deterministic dual-track formula: 60% of the score represents exact verified keyword coverage of required skills from project and work experience; 40% represents lexical vector cosine similarity (TF-IDF) across candidate text and the job description.',
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

  return (
    <section id="faq" className="py-24 sm:py-32 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (Sticky Heading) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 text-left">
            <div className="text-[13px] font-medium text-ink-muted">Common questions</div>
            <h2 className="text-[32px] sm:text-[38px] font-semibold text-ink tracking-tight leading-tight">
              Frequently asked questions
            </h2>
            <p className="text-[16px] text-ink-muted leading-relaxed">
              Everything you need to know about our deterministic resume evaluation engine and
              architecture.
            </p>
          </div>

          {/* Right Column: Accessible Accordion */}
          <div className="lg:col-span-7 divide-y divide-line border-y border-line text-left">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 text-left font-medium text-[16px] text-ink transition-colors cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-[6px] text-ink-muted shrink-0">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-champagne" strokeWidth={1.75} />
                      ) : (
                        <Plus className="w-4 h-4" strokeWidth={1.75} />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pt-3 pr-8 text-[15px] text-ink-muted leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
