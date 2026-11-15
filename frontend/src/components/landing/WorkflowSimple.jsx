export default function WorkflowSimple() {
  const steps = [
    {
      num: '01',
      title: 'Define required skills',
      desc: 'Create an opening specifying mandatory competencies for 60% keyword coverage and optional preferred skills.',
    },
    {
      num: '02',
      title: 'Ingest candidate files',
      desc: 'Upload PDF and DOCX files. SmartATS computes SHA-256 binary hashes to block duplicate submissions instantly.',
    },
    {
      num: '03',
      title: 'Review explainable rankings',
      desc: 'Inspect shortlisted applicants on the leaderboard with exact points breakdowns and side-by-side matrices.',
    },
  ];

  return (
    <section id="workflow" className="py-[72px] lg:py-[128px] bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="space-y-3 text-left mb-12 lg:mb-16">
          <div className="text-[13px] font-medium text-ink-muted uppercase tracking-wider">
            Simple 3-step workflow
          </div>
          <h2 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
            How SmartATS fits into your hiring pipeline.
          </h2>
        </div>

        {/* 3 Numbered Steps with Connecting Rule */}
        <div className="relative">
          {/* Subtle thin connecting horizontal rule across desktop steps */}
          <div className="hidden md:block absolute top-[28px] left-4 right-4 h-[1px] bg-line pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 relative text-left">
            {steps.map((step, idx) => (
              <div key={idx} className="space-y-4">
                <div className="inline-block bg-canvas pr-4">
                  <div className="text-[56px] font-semibold text-champagne tracking-tight leading-none tabular-nums select-none">
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
