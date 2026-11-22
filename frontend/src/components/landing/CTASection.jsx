import { ArrowRight } from 'lucide-react';

export default function CTASection({ onEnterApp }) {
  return (
    <section className="py-[72px] lg:py-[128px] bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* 24px Radius Solid Graphite Block (Dark surface in dark mode) */}
        <div className="relative isolate overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900 p-8 text-left text-zinc-100 shadow-xl sm:p-12 lg:p-16 dark:border-line dark:bg-surface">
          <img
            src="/images/cta-backdrop.webp"
            alt=""
            width="2400"
            height="900"
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40 dark:brightness-[0.8]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-zinc-950/35 dark:bg-surface/45" />

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
