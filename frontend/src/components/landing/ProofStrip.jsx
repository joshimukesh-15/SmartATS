import { Panel } from '../ui/Panel';

export default function ProofStrip() {
  const metrics = [
    {
      stat: '98.8%',
      label: 'Skill extraction F1-score',
      caption: 'Benchmark on evaluation_dataset (8 labeled candidate profiles)',
    },
    {
      stat: '1.000',
      label: 'NDCG@3 ranking accuracy',
      caption: 'Evaluated across 5 hybrid scoring configurations',
    },
    {
      stat: '3.6 ms',
      label: 'Average parsing latency',
      caption: 'PyMuPDF and python-docx benchmark across sample files',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-canvas">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <Panel className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-8 space-y-1.5 text-left">
              <div className="text-[36px] sm:text-[42px] font-semibold text-ink leading-tight tabular-nums tracking-tight">
                {m.stat}
              </div>
              <div className="text-[15px] font-medium text-ink">{m.label}</div>
              <div className="text-[13px] leading-[1.5] text-ink-muted">{m.caption}</div>
            </div>
          ))}
        </Panel>
      </div>
    </section>
  );
}
