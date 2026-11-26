import { ArrowRight } from 'lucide-react';

export default function CTASection({ onEnterApp }) {
  return (
    <section className="py-[72px] lg:py-[128px] bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Signature Dual-Navy Obsidian Showcase Block (#0B132B -> #1C2541 with blended subtle glow & neutral CTA) */}
        <div className="relative isolate overflow-hidden rounded-[24px] border border-cadet-steel/45 obsidian-showcase p-8 text-left text-white sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,192,222,0.16),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.16),transparent_70%)] blur-2xl"
          />
          <img
            src="/images/cta-backdrop.webp"
            alt=""
            width="2400"
            height="900"
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-obsidian-navy/45" />

          <div className="relative z-10 max-w-2xl space-y-6">
            {/* Warm Silk Cream & Amber Gold luxury highlight hairline above headline */}
            <div className="w-14 h-[2px] bg-gradient-to-r from-silk-cream to-amber-gold rounded-full" />

            {/* White headline */}
            <h2 className="text-[32px] sm:text-[42px] lg:text-[48px] font-semibold text-white tracking-[-0.03em] leading-[1.12]">
              Start screening candidates with explainable math.
            </h2>

            <p className="text-[15px] sm:text-[16px] text-slate-300 leading-[1.6] max-w-xl">
              Upload your engineering resumes today. Experience deterministic skill verification,
              zero hallucinations, and shortlists you can defend.
            </p>

            <div className="pt-2">
              {/* Crisp White Button on Obsidian Navy */}
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] bg-white text-obsidian-navy font-semibold text-[15px] hover:bg-slate-100 active:scale-[0.98] transition-all shadow-md cursor-pointer select-none"
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
