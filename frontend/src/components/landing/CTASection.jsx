import { ArrowRight } from 'lucide-react';

export default function CTASection({ onEnterApp }) {
  return (
    <section className="py-20 sm:py-28 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Solid Graphite Block (24px Radius) */}
        <div className="rounded-[24px] bg-[#14141A] text-white p-12 sm:p-16 lg:p-20 text-left space-y-8 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-[36px] sm:text-[46px] lg:text-[52px] font-semibold text-white tracking-tight leading-[1.08]">
              Start screening candidates with explainable math.
            </h2>
            <p className="text-[17px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
              Upload your engineering resumes today. Experience deterministic skill verification,
              zero hallucinations, and shortlists you can defend.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] bg-white text-[#14141A] font-semibold text-[15px] hover:bg-white/90 active:bg-white/80 transition-colors cursor-pointer select-none"
            >
              <span>Open the studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
