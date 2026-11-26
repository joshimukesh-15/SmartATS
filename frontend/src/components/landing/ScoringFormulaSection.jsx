import { useState, useEffect, useRef } from 'react';
import { DEFAULT_WEIGHTS } from '../../lib/constants';
import { FormulaLeaderboardPreview } from './FormulaLeaderboardPreview';
import { PillarExplanationCards } from './PillarExplanationCards';

const weights = DEFAULT_WEIGHTS || {
  skills: 0.40,
  text: 0.20,
  experience: 0.25,
  education: 0.15,
};

export default function ScoringFormulaSection() {
  const [activeTerm, setActiveTerm] = useState(null); // 'final' | 'skills' | 'text' | 'experience' | 'education' | null
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Fill once on view
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const demoCandidate = {
    name: 'Sarah Jenkins',
    skillsPct: 95.0,
    textPct: 91.0,
    expPct: 96.0,
    eduPct: 94.7,
    verified: ['Python', 'FastAPI', 'PostgreSQL'],
  };

  const demoSkillsPts = Number((demoCandidate.skillsPct * weights.skills).toFixed(1));
  const demoTextPts = Number((demoCandidate.textPct * weights.text).toFixed(1));
  const demoExpPts = Number((demoCandidate.expPct * weights.experience).toFixed(1));
  const demoEduPts = Number((demoCandidate.eduPct * weights.education).toFixed(1));
  const demoFinalScore = Number((demoSkillsPts + demoTextPts + demoExpPts + demoEduPts).toFixed(1));

  const sampleRows = [
    {
      rank: 1,
      name: demoCandidate.name,
      skillsPts: demoSkillsPts,
      textPts: demoTextPts,
      expPts: demoExpPts,
      eduPts: demoEduPts,
      total: demoFinalScore,
      verified: demoCandidate.verified,
    },
    {
      rank: 2,
      name: 'Alex Rivera',
      skillsPts: Number((85.0 * weights.skills).toFixed(1)),
      textPts: Number((85.0 * weights.text).toFixed(1)),
      expPts: Number((86.0 * weights.experience).toFixed(1)),
      eduPts: Number((90.0 * weights.education).toFixed(1)),
      total: 86.0,
      verified: ['Python', 'FastAPI'],
    },
    {
      rank: 3,
      name: 'Jordan Lee',
      skillsPts: Number((80.0 * weights.skills).toFixed(1)),
      textPts: Number((80.0 * weights.text).toFixed(1)),
      expPts: Number((80.0 * weights.experience).toFixed(1)),
      eduPts: Number((81.3 * weights.education).toFixed(1)),
      total: 80.2,
      verified: ['Python', 'Docker'],
    },
  ];

  return (
    <section
      id="scoring"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-canvas border-t border-line scroll-mt-16"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (5 cols): Signature Interactive Formula & Explanations */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="text-[13px] font-medium text-ink-muted">Scoring methodology</div>
            
            <h2 className="text-[32px] sm:text-[38px] font-semibold text-ink tracking-tight leading-tight">
              Transparent, auditable math for every recommendation.
            </h2>

            <p className="text-[16px] text-ink-muted leading-relaxed">
              SmartATS replaces generative black-box guessing with deterministic formulas. Every
              candidate fit score is calculated across four verifiable pillars:
            </p>

            {/* Signature Interactive Formula */}
            <div className="p-4 rounded-[12px] bg-surface border border-line shadow-xs space-y-3">
              <div className="text-[13px] font-semibold text-ink-subtle">
                Signature scoring equation
              </div>

              {/* Hoverable / Focusable Formula Terms */}
              <div className="flex flex-wrap items-center gap-1.5 text-[14px] sm:text-[15px] font-semibold text-ink select-none">
                <button
                  type="button"
                  onMouseEnter={() => setActiveTerm('final')}
                  onMouseLeave={() => setActiveTerm(null)}
                  onFocus={() => setActiveTerm('final')}
                  onBlur={() => setActiveTerm(null)}
                  className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    activeTerm === 'final'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'hover:bg-surface-alt text-ink'
                  }`}
                >
                  Final score
                </button>
                <span className="text-ink-subtle">=</span>
                <button
                  type="button"
                  onMouseEnter={() => setActiveTerm('skills')}
                  onMouseLeave={() => setActiveTerm(null)}
                  onFocus={() => setActiveTerm('skills')}
                  onBlur={() => setActiveTerm(null)}
                  className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    activeTerm === 'skills'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'hover:bg-surface-alt text-ink'
                  }`}
                >
                  {weights.skills.toFixed(2)} × Skills
                </button>
                <span className="text-ink-subtle">+</span>
                <button
                  type="button"
                  onMouseEnter={() => setActiveTerm('text')}
                  onMouseLeave={() => setActiveTerm(null)}
                  onFocus={() => setActiveTerm('text')}
                  onBlur={() => setActiveTerm(null)}
                  className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    activeTerm === 'text'
                      ? 'bg-amber-gold text-white shadow-xs'
                      : 'hover:bg-surface-alt text-ink'
                  }`}
                >
                  {weights.text.toFixed(2)} × Text
                </button>
                <span className="text-ink-subtle">+</span>
                <button
                  type="button"
                  onMouseEnter={() => setActiveTerm('experience')}
                  onMouseLeave={() => setActiveTerm(null)}
                  onFocus={() => setActiveTerm('experience')}
                  onBlur={() => setActiveTerm(null)}
                  className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    activeTerm === 'experience'
                      ? 'bg-slate-steel text-white shadow-xs'
                      : 'hover:bg-surface-alt text-ink'
                  }`}
                >
                  {weights.experience.toFixed(2)} × Exp
                </button>
                <span className="text-ink-subtle">+</span>
                <button
                  type="button"
                  onMouseEnter={() => setActiveTerm('education')}
                  onMouseLeave={() => setActiveTerm(null)}
                  onFocus={() => setActiveTerm('education')}
                  onBlur={() => setActiveTerm(null)}
                  className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    activeTerm === 'education'
                      ? 'bg-silk-cream text-obsidian-navy shadow-xs ring-1 ring-amber-gold/40'
                      : 'hover:bg-surface-alt text-ink'
                  }`}
                >
                  {weights.education.toFixed(2)} × Edu
                </button>
              </div>

              {/* Interactive 4-Segment Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded-[6px] bg-surface-alt overflow-hidden flex p-0.5 border border-line">
                  <div
                    style={{ width: inView ? `${demoSkillsPts}%` : '0%' }}
                    className={`h-full rounded-l-[4px] bg-primary transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'skills' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'skills' ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}`}
                  />
                  <div
                    style={{ width: inView ? `${demoTextPts}%` : '0%' }}
                    className={`h-full bg-champagne transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'text' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'text' ? 'ring-2 ring-champagne ring-offset-1 z-10' : ''}`}
                  />
                  <div
                    style={{ width: inView ? `${demoExpPts}%` : '0%' }}
                    className={`h-full bg-slate-steel transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'experience' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'experience' ? 'ring-2 ring-slate-steel ring-offset-1 z-10' : ''}`}
                  />
                  <div
                    style={{ width: inView ? `${demoEduPts}%` : '0%' }}
                    className={`h-full rounded-r-[4px] bg-silk-cream dark:bg-silk-cream/60 transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'education' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'education' ? 'ring-2 ring-amber-gold ring-offset-1 z-10' : ''}`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[13px] tabular-nums text-ink-muted gap-x-2">
                  <span className={activeTerm === 'skills' ? 'font-semibold text-ink' : ''}>
                    Skills: {demoSkillsPts.toFixed(1)} / {Math.round(weights.skills * 100)} pts
                  </span>
                  <span className={activeTerm === 'text' ? 'font-semibold text-ink' : ''}>
                    Text: {demoTextPts.toFixed(1)} / {Math.round(weights.text * 100)} pts
                  </span>
                  <span className={activeTerm === 'experience' ? 'font-semibold text-ink' : ''}>
                    Exp: {demoExpPts.toFixed(1)} / {Math.round(weights.experience * 100)} pts
                  </span>
                  <span className={activeTerm === 'education' ? 'font-semibold text-ink' : ''}>
                    Edu: {demoEduPts.toFixed(1)} / {Math.round(weights.education * 100)} pts
                  </span>
                  <span className={activeTerm === 'final' ? 'font-bold text-ink' : 'font-semibold text-ink'}>
                    Total: {demoFinalScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation Cards Linked to Hover States */}
            <PillarExplanationCards
              weights={weights}
              activeTerm={activeTerm}
              setActiveTerm={setActiveTerm}
            />
          </div>

          {/* Right Column: Extracted to FormulaLeaderboardPreview */}
          <FormulaLeaderboardPreview sampleRows={sampleRows} />
        </div>
      </div>
    </section>
  );
}
