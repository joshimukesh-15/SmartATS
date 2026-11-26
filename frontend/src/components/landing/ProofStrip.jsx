import { Panel } from '../ui/Panel';

export default function ProofStrip() {
  const metrics = [
    {
      stat: '100.0%',
      label: 'Skill extraction recall',
      caption: 'All labeled skills found across the benchmark profiles',
    },
    {
      stat: '98.8%',
      label: 'Skill extraction F1-score',
      caption: 'Harmonic mean of skill precision and recall',
    },
    {
      stat: '1.000',
      label: 'NDCG@3 · hybrid ranking',
      caption: 'Ranking quality across the benchmark job requisitions',
    },
  ];

  return (
    <section className="pt-20 sm:pt-24 pb-16 sm:pb-20 bg-canvas relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <Panel className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line shadow-sm">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-8 space-y-2 text-left transition-colors hover:bg-surface-alt/35">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[48px] font-semibold text-ink leading-none tabular-nums tracking-[-0.03em]">
                  {m.stat}
                </div>
                <span className={`w-2 h-2 rounded-[2px] ${idx === 0 ? 'bg-ice-blue' : idx === 1 ? 'bg-amber-gold' : 'bg-cadet-steel'}`} aria-hidden="true" />
              </div>
              <div className="text-[15px] font-semibold text-ink pt-1">{m.label}</div>
              <div className="text-[13px] leading-[1.5] text-ink-muted">{m.caption}</div>
            </div>
          ))}
        </Panel>
        <p className="mt-3 text-right text-[13px] text-ink-subtle">
          Internal benchmark · 8 labeled profiles across 3 job requisitions
        </p>

        <div className="mt-5 grid overflow-hidden rounded-[20px] border border-line bg-surface shadow-xs sm:grid-cols-[220px_minmax(0,1fr)]">
          <img
            src="/images/privacy-lock.webp"
            alt="Matte graphite padlock resting on a cream stone block"
            width="1400"
            height="1400"
            loading="lazy"
            className="h-44 w-full object-cover dark:brightness-[0.82] sm:h-full sm:min-h-48"
          />
          <div className="flex flex-col justify-center p-6 text-left sm:p-8">
            <p className="text-[13px] font-medium text-ink-muted">Privacy by design</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.025em] text-ink">Your hiring data stays close.</h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-[1.7] text-ink-muted">
              SmartATS runs locally, keeping resume review in your own workspace instead of sending candidate files to an external AI service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
