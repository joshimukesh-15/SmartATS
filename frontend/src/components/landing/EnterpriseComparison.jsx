import { Check, X, ShieldAlert, Sparkles, Scale } from 'lucide-react';
import { Panel } from '../ui/Panel';

export default function EnterpriseComparison() {
  const comparisonRows = [
    {
      feature: 'Ranking Explainability',
      legacy: 'Brittle Boolean keywords',
      legacyOk: false,
      blackbox: 'Unpredictable LLM hallucinations',
      blackboxOk: false,
      smartats: '100% Deterministic 4-Pillar Math',
      smartatsOk: true,
    },
    {
      feature: 'EEOC & Bias Audit Defensibility',
      legacy: 'No audit records',
      legacyOk: false,
      blackbox: 'High liability; scores drift randomly',
      blackboxOk: false,
      smartats: 'Mathematical proof with full audit trail',
      smartatsOk: true,
    },
    {
      feature: 'Resume Ingestion Latency',
      legacy: 'Slow manual reviews',
      legacyOk: false,
      blackbox: '20–40s per resume (API rate limits)',
      blackboxOk: false,
      smartats: 'Sub-15ms deterministic processing',
      smartatsOk: true,
    },
    {
      feature: 'Candidate Data Privacy',
      legacy: 'Clunky legacy servers',
      legacyOk: false,
      blackbox: 'Candidate PII sent to external models',
      blackboxOk: false,
      smartats: 'Zero third-party training; runs locally',
      smartatsOk: true,
    },
    {
      feature: 'Custom Weight Calibration',
      legacy: 'Static, hardcoded rules',
      legacyOk: false,
      blackbox: 'Fragile prompt modifications',
      blackboxOk: false,
      smartats: 'Real-time multi-pillar weight sliders',
      smartatsOk: true,
    },
    {
      feature: 'Duplicate & Fraud Defense',
      legacy: 'Easily tricked by re-uploads',
      legacyOk: false,
      blackbox: 'Re-evaluates every file as new',
      blackboxOk: false,
      smartats: 'SHA-256 automated hash blocking',
      smartatsOk: true,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-canvas border-t border-line">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-soft/70 border border-champagne/40 text-[12px] font-semibold text-champagne select-none">
            <Scale className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL COMPARISON</span>
          </div>
          <h2 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.035em] text-ink leading-tight">
            Why Enterprise Talent Leaders Choose SmartATS
          </h2>
          <p className="text-[16px] text-ink-muted leading-relaxed">
            Compare traditional keyword filters, opaque generative AI chatbots, and SmartATS’s auditable, deterministic intelligence.
          </p>
        </div>

        <div className="mt-14 overflow-x-auto">
          <Panel className="min-w-[760px] overflow-hidden p-0 shadow-sm border border-line">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-alt/60 text-[13px] font-semibold text-ink">
                  <th className="py-4 px-6 w-1/4">Capability & Assurance</th>
                  <th className="py-4 px-6 w-1/4 text-ink-muted">Legacy Keyword ATS</th>
                  <th className="py-4 px-6 w-1/4 text-ink-muted">Blackbox Generative LLMs</th>
                  <th className="py-4 px-6 w-1/4 bg-primary text-on-primary">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-champagne" />
                      <span>SmartATS Enterprise</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[14px]">
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface-alt/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-ink">{row.feature}</td>
                    <td className="py-4 px-6 text-ink-muted">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-danger/80 shrink-0" />
                        <span>{row.legacy}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-ink-muted">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{row.blackbox}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 bg-surface-alt/40 font-medium text-ink">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </div>
                        <span>{row.smartats}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </section>
  );
}
