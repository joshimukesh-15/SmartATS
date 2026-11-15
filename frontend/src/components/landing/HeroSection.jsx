import { useState, useMemo } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button, ScoreBar, ScoreValue } from '../ui';
import { computeBreakdown, sortCandidates } from '../../lib/score';

const INITIAL_SKILLS = ['React', 'TypeScript', 'Node.js'];

const SAMPLE_CANDIDATES = [
  {
    id: 'c1',
    name: 'Sarah Jenkins',
    matched_skills: ['React', 'TypeScript', 'Node.js'],
    text_match: 88,
  },
  {
    id: 'c2',
    name: 'Alex Rivera',
    matched_skills: ['React', 'TypeScript'],
    text_match: 84,
  },
  {
    id: 'c3',
    name: 'Jordan Lee',
    matched_skills: ['React'],
    text_match: 92,
  },
];

export default function HeroSection({ onEnterApp }) {
  const [activeSkills, setActiveSkills] = useState(['React', 'TypeScript']);

  const toggleSkill = (skill) => {
    setActiveSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Re-score and re-order live when required skills change
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
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 bg-canvas slant-bottom overflow-hidden border-b border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Left-Aligned Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-[clamp(44px,5.2vw,76px)] font-semibold tracking-[-0.04em] leading-[1.04] text-ink text-left">
              Know exactly why every candidate ranks where they do.
            </h1>

            <p className="text-[17px] sm:text-[18px] text-ink-muted leading-relaxed font-sans text-left max-w-xl">
              SmartATS scores resumes with transparent, auditable math: required skills, matched
              evidence, and gaps, so every shortlist can be explained.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button variant="primary" size="lg" onClick={onEnterApp}>
                Open the studio
              </Button>
              <a
                href="#scoring"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:text-ink-muted transition-colors"
              >
                <span>See how scoring works</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: LIVE Scoring Demo */}
          <div className="lg:col-span-6">
            <div className="rounded-[14px] border border-line bg-surface p-6 space-y-6 shadow-xs">
              {/* Interactive Skill Toggles Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink">Toggle required skills:</span>
                  <span className="text-[13px] text-ink-subtle">Live demo</span>
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
                        {active && <Check className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Candidate Cards (re-scored & re-ordered live) */}
              <div className="space-y-3">
                {scoredCandidates.map((cand, idx) => {
                  const b = cand.breakdown;
                  return (
                    <div
                      key={cand.id}
                      className="p-4 rounded-[10px] border border-line bg-surface-alt/40 space-y-2 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-[4px] bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-ink text-[14px]">{cand.name}</span>
                        </div>
                        <ScoreValue score={cand.final_score} size="sm" />
                      </div>

                      <ScoreBar
                        skillsPoints={b.skillsCoveredPoints}
                        textMatchPoints={b.textMatchPoints}
                        finalScore={b.finalScore}
                        height="h-1.5"
                      />

                      <div className="text-[13px] text-ink-muted flex items-center justify-between tabular-nums pt-0.5">
                        <span>Skills covered: {b.skillsCoveredPoints.toFixed(1)} pts</span>
                        <span>Text match: {b.textMatchPoints.toFixed(1)} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[13px] text-ink-muted leading-normal pt-1 border-t border-line">
                Formula: (Skills covered % × 0.6) + (Text match % × 0.4) = Final score
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
