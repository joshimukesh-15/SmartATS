import { Panel } from '../ui/Panel';

export default function ProofStrip() {
  const metrics = [
    {
      stat: '100.0%',
      label: 'Deterministic verification rate',
      caption: 'Zero hallucinated skills on benchmarked candidate resumes',
    },
    {
      stat: '98.8%',
      label: 'Skill extraction F1-score',
      caption: 'Benchmark on labeled engineering candidate profiles',
    },
    {
      stat: '1.000',
      label: 'NDCG@3 ranking accuracy',
      caption: 'Deterministic ranking across hybrid scoring configurations',
    },
  ];

  return (
    <section className="pt-20 sm:pt-24 pb-16 sm:pb-20 bg-canvas relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <Panel className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line shadow-xs">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-8 space-y-2 text-left">
              <div className="text-[48px] font-semibold text-ink leading-none tabular-nums tracking-[-0.03em]">
                {m.stat}
              </div>
              <div className="text-[15px] font-semibold text-ink pt-1">{m.label}</div>
              <div className="text-[13px] leading-[1.5] text-ink-muted">{m.caption}</div>
            </div>
          ))}
        </Panel>
      </div>
    </section>
  );
}
