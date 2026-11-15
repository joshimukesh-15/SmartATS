import React from 'react';
import Reveal from './Reveal';

export default function CTASection({ onEnterApp }) {
  return (
    <section className="py-24 sm:py-36 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="rounded-[16px] bg-gradient-to-br from-ink via-wine-deep to-ink p-12 sm:p-20 text-left text-canvas shadow-[0_1px_2px_rgba(42,16,21,0.04),0_24px_64px_rgba(42,16,21,0.08)]">
          <div className="max-w-2xl space-y-8">
            <Reveal>
              <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] font-serif font-normal text-canvas">
                Bring auditable clarity to your candidate shortlists.
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-[18px] text-surface-alt/80 leading-[1.65] font-sans">
                Replace guesswork with deterministic keyword verification and normalized text similarity.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div>
                <button
                  onClick={onEnterApp}
                  className="px-8 py-4 bg-canvas hover:bg-surface-alt text-ink rounded-[8px] text-[16px] font-medium transition-colors shadow-xs"
                >
                  Open the studio
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
