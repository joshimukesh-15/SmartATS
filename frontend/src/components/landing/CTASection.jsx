import { ArrowRight } from 'lucide-react';

export default function CTASection({ onEnterApp }) {
  return (
    <section className="py-[72px] lg:py-[128px] bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Full Silk Cream (#F4D6B0) & Molten Amber (#D97706) Showcase Card */}
        <div className="relative isolate overflow-hidden rounded-[24px] border border-amber-gold/35 silk-amber-showcase p-8 text-left text-espresso-ink dark:text-ink sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(217,119,6,0.32),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.28),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(244,214,176,0.18),transparent_70%)] blur-2xl"
          />
          <img
            src="/images/cta-backdrop.webp"
            alt=""
            width="2400"
            height="900"
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15 sepia-[0.45] mix-blend-multiply dark:mix-blend-soft-light"
          />

          <div className="relative z-10 max-w-2xl space-y-6">
            {/* Warm Burnt Amber accent rule above headline */}
            <div className="w-14 h-[2px] bg-gradient-to-r from-amber-gold to-silk-cream rounded-full" />

            <h2 className="text-[32px] sm:text-[42px] lg:text-[48px] font-semibold text-espresso-ink dark:text-silk-cream tracking-[-0.03em] leading-[1.12]">
              Start screening candidates with explainable math.
            </h2>

            <p className="text-[15px] sm:text-[16px] text-ink-muted leading-[1.6] max-w-xl">
              Upload your engineering resumes today. Experience deterministic skill verification,
              zero hallucinations, and shortlists you can defend.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] bg-gradient-to-b from-amber-gold to-amber-deep text-white font-semibold text-[15px] hover:from-primary-hover hover:to-amber-deep active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(217,119,6,0.35)] ring-1 ring-inset ring-silk-cream/40 cursor-pointer select-none"
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
