import React, { useState } from 'react';
import { Plus, ArrowRight, HelpCircle } from 'lucide-react';
import Reveal from './Reveal';
import MagneticButton from './MagneticButton';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does SmartATS guarantee zero AI hallucination?',
      a: 'Unlike generative chat systems that synthesize unverifiable summaries, SmartATS uses deterministic rule-based entity parsing coupled with mathematical vector TF-IDF scoring. Every reported skill match corresponds directly to a verifiable character index in the parsed document.',
    },
    {
      q: 'What file formats and layout complexities are supported?',
      a: 'SmartATS accepts both PDF and DOCX files up to 15MB. Our multimodal parsing pipeline employs PyMuPDF for native vector text extraction alongside an automated Tesseract OCR engine for flattened graphic resumes and scanned documents.',
    },
    {
      q: 'How does binary duplicate detection work across job openings?',
      a: 'During ingestion, a SHA-256 cryptographic digest is calculated from the raw file bytes. If the identical document is re-uploaded for another opening or by an external staffing agency, it is instantly recognized without requiring costly re-computation.',
    },
    {
      q: 'Can the 60% Keyword / 40% Vector weighting formula be audited?',
      a: 'Yes. Each candidate dossier exposes an explainable diagnostic breakdown: keyword coverage counts every mandatory skill, while cosine similarity evaluates contextual depth against the job description. All metrics are 100% auditable.',
    },
    {
      q: 'Is candidate data private, or is it used for public model training?',
      a: 'SmartATS operates completely on private, self-contained infrastructure. Candidate resumes are parsed locally in memory, indexed in your secure relational database, and never transmitted to third-party public foundation models.',
    },
  ];

  return (
    <section id="faq" className="py-24 md:py-36 bg-[#FBF7F2] border-t border-[#E8DDD0]">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Sticky Pitch & Contact */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
            <Reveal staggerIndex={0}>
              <span className="text-xs uppercase font-mono tracking-[0.14em] text-[#B8893B] font-semibold">
                Transparent Specifications
              </span>
            </Reveal>

            <Reveal staggerIndex={1}>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2A1015] tracking-tight leading-[1.1]">
                Frequently Addressed Inquiries
              </h2>
            </Reveal>

            <Reveal staggerIndex={2}>
              <p className="text-base text-[#6B5A55] font-sans leading-relaxed">
                Need specialized compliance details, algorithmic weights, or custom enterprise on-premises integrations? Our engineering team is directly accessible.
              </p>
            </Reveal>

            <Reveal staggerIndex={3}>
              <div className="pt-2">
                <a href="mailto:talent-systems@smartats.internal">
                  <MagneticButton
                    variant="secondary"
                    className="px-6 py-3.5 text-xs"
                  >
                    Direct Engineering Contact
                  </MagneticButton>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Accordion with Rotating Plus Icon & Gold Hairlines */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <Reveal key={idx} staggerIndex={idx}>
                  <div
                    className={`border-b border-[#B8893B]/25 transition-all duration-300 rounded-xl ${
                      isOpen ? 'bg-[#F8ECEF]/60 px-5 py-4' : 'px-2 py-4 hover:bg-[#F5EEE6]/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between text-left space-x-4 cursor-pointer focus:outline-none"
                    >
                      <span className="font-serif font-bold text-lg sm:text-xl text-[#2A1015]">
                        {faq.q}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full border border-[#B8893B]/30 flex items-center justify-center text-[#B8893B] flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-45 bg-[#7B1E3A] text-white border-[#7B1E3A]' : ''
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm text-[#6B5A55] font-sans leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
