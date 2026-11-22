import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { ScoreValue, ScoreBar } from '../ui';
import { ProductFrame } from './ProductFrame';
import { DEFAULT_WEIGHTS } from '../../lib/constants';

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

  // Benchmark calculation for interactive formula display across 4 pillars computed from demo candidate
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
              <div className="text-[13px] font-medium text-ink-subtle uppercase tracking-wider">
                Signature Scoring Equation
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
                      ? 'bg-champagne text-ink shadow-xs'
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
                      ? 'bg-ink-muted text-on-primary shadow-xs'
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
                      ? 'bg-champagne/60 text-ink shadow-xs'
                      : 'hover:bg-surface-alt text-ink'
                  }`}
                >
                  {weights.education.toFixed(2)} × Edu
                </button>
              </div>

              {/* Interactive 4-Segment Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded-full bg-surface-alt overflow-hidden flex p-0.5 border border-line">
                  {/* Skills Covered Segment (40% Weight) */}
                  <div
                    style={{ width: inView ? `${demoSkillsPts}%` : '0%' }}
                    className={`h-full rounded-l-full bg-primary transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'skills' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'skills' ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}`}
                  />
                  {/* Text Match Segment (20% Weight) */}
                  <div
                    style={{ width: inView ? `${demoTextPts}%` : '0%' }}
                    className={`h-full bg-champagne transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'text' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'text' ? 'ring-2 ring-champagne ring-offset-1 z-10' : ''}`}
                  />
                  {/* Experience Segment (25% Weight) */}
                  <div
                    style={{ width: inView ? `${demoExpPts}%` : '0%' }}
                    className={`h-full bg-ink-muted transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'experience' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'experience' ? 'ring-2 ring-ink-muted ring-offset-1 z-10' : ''}`}
                  />
                  {/* Education Segment (15% Weight) */}
                  <div
                    style={{ width: inView ? `${demoEduPts}%` : '0%' }}
                    className={`h-full rounded-r-full bg-champagne/40 transition-all duration-1000 ease-out ${
                      activeTerm && activeTerm !== 'final' && activeTerm !== 'education' ? 'opacity-30' : 'opacity-100'
                    } ${activeTerm === 'education' ? 'ring-2 ring-champagne ring-offset-1 z-10' : ''}`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[12px] sm:text-[13px] tabular-nums text-ink-muted gap-x-2">
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
            <div className="space-y-3 pt-1">
              <div
                onMouseEnter={() => setActiveTerm('skills')}
                onMouseLeave={() => setActiveTerm(null)}
                className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
                  activeTerm === 'skills'
                    ? 'border-primary bg-surface shadow-sm ring-1 ring-primary'
                    : 'border-line bg-surface hover:border-ink-subtle'
                }`}
              >
                <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span>Required skills</span>
                  </div>
                  <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.skills * 100)}% weight</span>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  Deterministic verification of required competencies extracted directly from candidate
                  work history and quantified achievements.
                </p>
              </div>

              <div
                onMouseEnter={() => setActiveTerm('text')}
                onMouseLeave={() => setActiveTerm(null)}
                className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
                  activeTerm === 'text'
                    ? 'border-champagne bg-surface shadow-sm ring-1 ring-champagne'
                    : 'border-line bg-surface hover:border-ink-subtle'
                }`}
              >
                <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-champagne" />
                    <span>Semantic text alignment</span>
                  </div>
                  <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.text * 100)}% weight</span>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  TF-IDF vector cosine similarity evaluating lexical and semantic vocabulary alignment between resume
                  context and role responsibilities.
                </p>
              </div>

              <div
                onMouseEnter={() => setActiveTerm('experience')}
                onMouseLeave={() => setActiveTerm(null)}
                className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
                  activeTerm === 'experience'
                    ? 'border-ink-muted bg-surface shadow-sm ring-1 ring-ink-muted'
                    : 'border-line bg-surface hover:border-ink-subtle'
                }`}
              >
                <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-muted" />
                    <span>Experience fit</span>
                  </div>
                  <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.experience * 100)}% weight</span>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  Seniority scoring comparing verified total years in relevant software engineering roles against job tier requirements.
                </p>
              </div>

              <div
                onMouseEnter={() => setActiveTerm('education')}
                onMouseLeave={() => setActiveTerm(null)}
                className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
                  activeTerm === 'education'
                    ? 'border-champagne bg-surface shadow-sm ring-1 ring-champagne/60'
                    : 'border-line bg-surface hover:border-ink-subtle'
                }`}
              >
                <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-champagne/60" />
                    <span>Education & credentials</span>
                  </div>
                  <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.education * 100)}% weight</span>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  Evaluates degree levels (B.S., M.S., Ph.D.) and academic or professional certifications matching the target discipline.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Real Leaderboard in Browser Frame */}
          <div className="lg:col-span-7">
            <ProductFrame url="smartats.app/studio/leaderboard" className="shadow-xs">
              <div className="p-6 space-y-4 bg-surface">
                <div className="flex items-center justify-between pb-3 border-b border-line text-[13px] font-medium text-ink-muted">
                  <span>Rank & Candidate</span>
                  <span className="hidden sm:inline">Verified skills</span>
                  <span className="text-right">Final score</span>
                </div>

                <div className="space-y-3">
                  {sampleRows.map((row) => (
                    <div
                      key={row.rank}
                      className="p-3.5 rounded-[10px] border border-line bg-surface-alt/40 flex items-center justify-between gap-4 transition-colors hover:bg-surface-alt/60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center shrink-0">
                          {row.rank}
                        </span>
                        <div>
                          <div className="text-[14px] font-semibold text-ink">{row.name}</div>
                          <div className="text-[13px] text-ink-muted">Verified application</div>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5">
                        {row.verified.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-[4px] bg-champagne-soft text-ink font-medium"
                          >
                            <Check className="w-3.5 h-3.5 text-champagne" strokeWidth={1.75} />
                            <span>{s}</span>
                          </span>
                        ))}
                      </div>

                      <div className="w-32 text-right space-y-1 shrink-0">
                        <ScoreValue score={row.total} size="sm" />
                        <ScoreBar
                          skillsPoints={row.skillsPts}
                          textMatchPoints={row.textPts}
                          experiencePoints={row.expPts}
                          educationPoints={row.eduPts}
                          finalScore={row.total}
                          height="h-1.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-[8px] bg-surface-alt/50 border border-line text-[13px] text-ink-muted flex items-center justify-between">
                  <span>Deterministic 4-Pillar Calculation</span>
                  <span className="font-semibold text-ink tabular-nums">3 Candidates Scored</span>
                </div>
              </div>
            </ProductFrame>
            <figure className="mt-4 overflow-hidden rounded-[20px] border border-line bg-surface shadow-xs">
              <img
                src="/images/recruiter-desk.webp"
                alt="Hiring manager reviewing printed resumes at a tidy desk beside a window"
                width="1800"
                height="1200"
                loading="lazy"
                className="aspect-[3/2] w-full object-cover dark:brightness-[0.82]"
              />
              <figcaption className="border-t border-line px-4 py-3 text-[13px] text-ink-muted">
                Candidate evidence, reviewed with care.
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
