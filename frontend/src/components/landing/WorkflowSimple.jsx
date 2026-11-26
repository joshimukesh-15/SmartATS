import { DEFAULT_WEIGHTS } from '../../lib/constants';

const weights = DEFAULT_WEIGHTS || {
  skills: 0.40,
  text: 0.20,
  experience: 0.25,
  education: 0.15,
};

export default function WorkflowSimple() {
  const steps = [
    {
      num: '01',
      title: 'Define job criteria & weights',
      desc: `Create an opening with required skills (${Math.round(weights.skills * 100)}%), text match (${Math.round(weights.text * 100)}%), experience fit (${Math.round(weights.experience * 100)}%), and education (${Math.round(weights.education * 100)}%), or customize weights per role.`,
    },
    {
      num: '02',
      title: 'Ingest candidate files',
      desc: 'Upload PDF and DOCX files. SmartATS computes SHA-256 binary hashes to block duplicate submissions instantly.',
    },
    {
      num: '03',
      title: 'Review explainable rankings',
      desc: 'Inspect shortlisted applicants on the leaderboard with exact 4-pillar points breakdowns and side-by-side matrices.',
    },
  ];

  return (
    <section id="workflow" className="py-[72px] lg:py-[128px] bg-canvas border-t border-line scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-12 max-w-3xl space-y-3 text-left lg:mb-16">
          <div className="text-[13px] font-medium text-ink-muted">
            A thoughtful review process
          </div>
          <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">
            How SmartATS fits into your hiring pipeline.
          </h2>
          <p className="max-w-2xl text-[15px] leading-[1.7] text-ink-muted">
            Move from a clear role brief to an organized shortlist, with evidence your team can return to at every step.
          </p>
        </div>

        {/* 3 Numbered Steps with Connecting Rule */}
        <div className="relative">
          {/* Subtle thin connecting hairline gradient rule across desktop steps */}
          <div className="hidden md:block absolute top-[28px] left-4 right-4 h-[1px] hairline-divider pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 relative text-left">
            {steps.map((step, idx) => (
              <div key={idx} className="space-y-4">
                <div className="inline-block bg-canvas pr-4">
                  <div className="text-[56px] font-semibold text-amber-gold/45 dark:text-silk-cream/45 tracking-tight leading-none tabular-nums select-none">
                    {step.num}
                  </div>
                </div>
                <div className="h-[1px] w-full bg-line md:hidden" />
                <h3 className="text-[17px] font-semibold text-ink leading-[1.35] pt-1">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-[1.6] text-ink-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
