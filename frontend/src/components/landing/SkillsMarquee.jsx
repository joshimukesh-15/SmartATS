import React from 'react';

const SKILLS = [
  'React',
  'FastAPI',
  'PostgreSQL',
  'TypeScript',
  'Docker',
  'Python',
  'Tailwind CSS',
  'PyMuPDF',
  'Redis',
  'GraphQL',
  'AWS Lambda',
  'Kubernetes',
  'Next.js',
  'Tesseract OCR',
  'Vector TF-IDF',
  'Scikit-learn',
];

export default function SkillsMarquee() {
  return (
    <section className="py-10 bg-[#FBF7F2] border-y border-[#E8DDD0] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 mb-4 text-center">
        <span className="text-[11px] uppercase font-mono tracking-[0.14em] text-[#B8893B] font-semibold">
          Universal Parsing & Evaluation Compatibility
        </span>
      </div>

      {/* Marquee Track with Mask Fade on Left & Right */}
      <div
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
        className="relative w-full overflow-hidden"
      >
        <div className="animate-marquee py-2 flex items-center space-x-6 cursor-default">
          {/* First loop */}
          {SKILLS.map((skill, idx) => (
            <div
              key={`a-${idx}`}
              className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white border border-[#E8DDD0] hover:border-[#B8893B]/50 transition-colors shadow-xs"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#B8893B]" />
              <span className="font-mono text-xs font-semibold text-[#2A1015] whitespace-nowrap">
                {skill}
              </span>
            </div>
          ))}

          {/* Second loop for infinite continuity */}
          {SKILLS.map((skill, idx) => (
            <div
              key={`b-${idx}`}
              className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white border border-[#E8DDD0] hover:border-[#B8893B]/50 transition-colors shadow-xs"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#B8893B]" />
              <span className="font-mono text-xs font-semibold text-[#2A1015] whitespace-nowrap">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
