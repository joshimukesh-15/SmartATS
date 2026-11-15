import { ArrowRight } from 'lucide-react';

export default function CTASection({ onEnterApp }) {
  return (
    <section className="py-[72px] lg:py-[128px] bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* 24px Radius Solid Graphite Block (Dark surface in dark mode) */}
        <div className="rounded-[24px] bg-zinc-900 dark:bg-surface text-zinc-100 border border-zinc-800 dark:border-line p-8 sm:p-12 lg:p-16 text-left relative overflow-hidden shadow-xl">
          {/* Dot-grid background at 8% opacity */}
          <div className="absolute inset-0 dot-grid-bg opacity-[0.08] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            {/* Hairline champagne rule above headline */}
            <div className="w-14 h-[2px] bg-champagne rounded-full" />

            {/* White headline */}
            <h2 className="text-[32px] sm:text-[42px] lg:text-[48px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Start screening candidates with explainable math.
            </h2>

            <p className="text-[15px] sm:text-[16px] text-zinc-300 dark:text-ink-muted leading-[1.6] max-w-xl">
              Upload your engineering resumes today. Experience deterministic skill verification,
              zero hallucinations, and shortlists you can defend.
            </p>

            <div className="pt-2">
              {/* Inverted Button */}
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] bg-white text-zinc-950 font-semibold text-[15px] hover:bg-zinc-100 active:bg-zinc-200 transition-colors shadow-sm cursor-pointer select-none"
              >
                <span>Open the studio</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
