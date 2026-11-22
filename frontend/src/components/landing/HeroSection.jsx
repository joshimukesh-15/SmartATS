import { useState, useMemo } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button, ScoreBar, ScoreValue, Avatar } from '../ui';
import { ProductFrame } from './ProductFrame';
import { computeBreakdown, sortCandidates } from '../../lib/score';
import { DEFAULT_WEIGHTS } from '../../lib/constants';

const weights = DEFAULT_WEIGHTS || {
  skills: 0.40,
  text: 0.20,
  experience: 0.25,
  education: 0.15,
};

const INITIAL_SKILLS = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];

const SAMPLE_CANDIDATES = [
  {
    id: 'c1',
    name: 'Sarah Jenkins',
    matched_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    text_match: 92,
    experience_score: 95,
    education_score: 90,
  },
  {
    id: 'c2',
    name: 'Alex Rivera',
    matched_skills: ['React', 'TypeScript', 'Node.js'],
    text_match: 86,
    experience_score: 84,
    education_score: 85,
  },
  {
    id: 'c3',
    name: 'Jordan Lee',
    matched_skills: ['React', 'TypeScript'],
    text_match: 88,
    experience_score: 76,
    education_score: 80,
  },
];

export default function HeroSection({ onEnterApp }) {
  const [activeSkills, setActiveSkills] = useState(['React', 'TypeScript', 'Node.js']);

  const toggleSkill = (skill) => {
    setActiveSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Re-score and re-order live with 350ms smooth transition
  const scoredCandidates = useMemo(() => {
    const list = SAMPLE_CANDIDATES.map((cand) => {
      const breakdown = computeBreakdown(cand, { required_skills: activeSkills });
      return {
        ...cand,
        final_score: breakdown.finalScore,
        breakdown,
      };
    });
    return sortCandidates(list, 'score', 'desc');
  }, [activeSkills]);

  return (
    <section className="relative isolate overflow-visible border-b border-line bg-canvas pb-20 pt-32 sm:pb-28 sm:pt-40">
      <img
        src="/images/hero-backdrop.webp"
        alt=""
        width="2400"
        height="1400"
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center dark:brightness-[0.65]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-canvas via-canvas/90 to-canvas/45 dark:via-canvas/80 dark:to-canvas/60" />
      <div className="relative z-10 mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (5 cols): Headline, Sentence, CTAs, No Account Note */}
          <div className="lg:col-span-5 space-y-6 relative">
            {/* Dot Grid Background behind headline */}
            <div className="absolute -top-12 -left-10 w-96 h-96 dot-grid-bg pointer-events-none opacity-60 dark:opacity-40" />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-alt/70 border border-line text-[13px] text-ink-muted font-medium select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                <span>Deterministic 4-Pillar Scoring ({Math.round(weights.skills * 100)}/{Math.round(weights.text * 100)}/{Math.round(weights.experience * 100)}/{Math.round(weights.education * 100)})</span>
              </div>

              <h1 className="text-[clamp(38px,4.2vw,64px)] font-semibold tracking-[-0.04em] leading-[1.06] text-ink text-left">
                Know exactly why every candidate ranks where they do.
              </h1>

              <p className="text-[17px] sm:text-[18px] text-ink-muted leading-[1.6] text-left max-w-xl">
                SmartATS scores resumes with transparent, auditable math across 4 deterministic pillars:
                {` ${Math.round(weights.skills * 100)}% required skills, ${Math.round(weights.text * 100)}% semantic text match, ${Math.round(weights.experience * 100)}% experience fit, and ${Math.round(weights.education * 100)}% education, so every shortlist can be defended.`}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button variant="primary" size="lg" onClick={onEnterApp}>
                  Open the studio
                </Button>
                <a
                  href="#scoring"
                  className="inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:text-ink-muted transition-colors"
                >
                  <span>See how scoring works</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </a>
              </div>

              {/* No account needed note */}
              <div className="text-[13px] text-ink-subtle flex items-center gap-2 pt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                <span>No account needed. Runs locally.</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): <ProductFrame> with 48px Bottom Overlap */}
          <div className="lg:col-span-7 relative z-20 lg:-mb-12 lg:translate-y-12">
            <ProductFrame url="smartats.app/studio/leaderboard" className="shadow-lg">
              <div className="p-5 sm:p-6 space-y-5 bg-surface">
                {/* Live Demo Skill Toggle Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ink">
                      Toggle required job competencies:
                    </span>
                    <span className="text-[13px] font-medium text-champagne bg-champagne-soft/60 px-2 py-0.5 rounded-[6px]">
                      Live demo
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {INITIAL_SKILLS.map((skill) => {
                      const active = activeSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer select-none border ${
                            active
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-alt text-ink border-line hover:border-ink-subtle'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5" strokeWidth={1.75} />}
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate Table with Avatar, Rank Markers, Two-Segment Bars */}
                <div className="space-y-2.5">
                  {scoredCandidates.map((cand, idx) => {
                    const b = cand.breakdown;
                    const isTop = idx === 0;

                    return (
                      <div
                        key={cand.id}
                        className={`p-3.5 rounded-[10px] border transition-all duration-350 ease-out space-y-2 ${
                          isTop
                            ? 'bg-surface-alt/70 border-line shadow-xs'
                            : 'bg-surface-alt/30 border-line/60 hover:bg-surface-alt/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Rank Marker */}
                            <span
                              className={`w-6 h-6 rounded-[6px] font-semibold text-[13px] flex items-center justify-center shrink-0 ${
                                isTop
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-surface text-ink-muted border border-line'
                              }`}
                            >
                              {idx + 1}
                            </span>

                            {/* Avatar */}
                            <Avatar name={cand.name} size="sm" />

                            {/* Name & Matched Skills */}
                            <div className="min-w-0">
                              <div className="font-semibold text-ink text-[14px] truncate">
                                {cand.name}
                              </div>
                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                {cand.matched_skills.map((s) => (
                                  <span
                                    key={s}
                                    className={`inline-flex items-center gap-0.5 text-[13px] px-1.5 py-0.2 rounded-[4px] font-medium ${
                                      activeSkills.includes(s)
                                        ? 'bg-champagne-soft text-ink'
                                        : 'bg-surface text-ink-muted border border-line/60'
                                    }`}
                                  >
                                    <Check className="w-3 h-3 text-champagne shrink-0" strokeWidth={1.75} />
                                    <span>{s}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <ScoreValue score={cand.final_score} size="sm" />
                          </div>
                        </div>

                        {/* Multi-Segment Score Bar (4 Pillars) */}
                        <ScoreBar
                          skillsPoints={b.skillsCoveredPoints}
                          textMatchPoints={b.textMatchPoints}
                          experiencePoints={b.experiencePoints}
                          educationPoints={b.educationPoints}
                          finalScore={b.finalScore}
                          height="h-2"
                        />

                        {/* Live Formula Breakdown Line Under Top Candidate (4 Point-Math Components) */}
                        {isTop && (
                          <div className="mt-2 pt-2 border-t border-line/70 space-y-1.5 text-[12px] sm:text-[13px] font-medium transition-all duration-350 ease-out">
                            <div className="flex items-center justify-between gap-2 text-ink">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-champagne shrink-0" />
                                <span className="text-ink-muted">Top Candidate Formula (4-Pillar):</span>
                              </div>
                              <div className="text-champagne font-semibold tabular-nums shrink-0">
                                = {cand.final_score.toFixed(1)}% final score
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] tabular-nums text-ink-muted">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                <span>Skills ({Math.round(weights.skills * 100)}%): <strong className="text-ink font-semibold">{b.skillsCoveredPoints.toFixed(1)} pts</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-champagne shrink-0" />
                                <span>Text ({Math.round(weights.text * 100)}%): <strong className="text-ink font-semibold">{b.textMatchPoints.toFixed(1)} pts</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-ink-muted shrink-0" />
                                <span>Exp ({Math.round(weights.experience * 100)}%): <strong className="text-ink font-semibold">{b.experiencePoints.toFixed(1)} pts</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-champagne/40 shrink-0" />
                                <span>Edu ({Math.round(weights.education * 100)}%): <strong className="text-ink font-semibold">{b.educationPoints.toFixed(1)} pts</strong></span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[13px] text-ink-muted leading-normal pt-1 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Deterministic: {Math.round(weights.skills * 100)}% Required Skills + {Math.round(weights.text * 100)}% Text Match + {Math.round(weights.experience * 100)}% Experience + {Math.round(weights.education * 100)}% Education</span>
                  <span className="text-ink-subtle">Updated live (350ms)</span>
                </div>
              </div>
            </ProductFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
