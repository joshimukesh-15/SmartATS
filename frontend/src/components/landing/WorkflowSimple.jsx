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
    <section id="workflow" className="py-24 sm:py-32 bg-canvas border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
        <div className="space-y-2 text-left">
          <div className="text-[13px] font-medium text-ink-muted">Simple 3-step workflow</div>
          <h2 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
            How SmartATS fits into your hiring pipeline.
          </h2>
        </div>

        {/* 3 Numbered Steps with Connecting Top Rule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-3 pt-6 border-t border-line text-left">
              <div className="text-[20px] font-semibold text-champagne tabular-nums">
                {step.num}
              </div>
              <h3 className="text-[17px] font-semibold text-ink leading-[1.35]">{step.title}</h3>
              <p className="text-[15px] leading-[1.6] text-ink-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
