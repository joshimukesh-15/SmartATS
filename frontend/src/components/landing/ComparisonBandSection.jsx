const ROWS = [
  {
    criterion: 'Synonym handling',
    boolean: 'Exact literal substring only',
    llm: 'Uncontrolled prompt paraphrase',
    smartats: 'Canonical skill alias map',
  },
  {
    criterion: 'Repeatability',
    boolean: 'Deterministic match or miss',
    llm: 'Output drifts across runs',
    smartats: 'Identical shortlist on every rerun',
  },
  {
    criterion: 'Score evidence',
    boolean: 'Binary filter without weight',
    llm: 'Free-text prose without math',
    smartats: 'Four stored pillar scores per row',
  },
  {
    criterion: 'Duplicate files',
    boolean: 'Re-parses renamed uploads',
    llm: 'Consumes API tokens twice',
    smartats: 'Skipped cleanly by SHA-256 hash',
  },
  {
    criterion: 'Data boundary',
    boolean: 'External SaaS upload queue',
    llm: 'Routes resumes to remote APIs',
    smartats: 'Self-hosted FastAPI and PostgreSQL',
  },
];

export function ComparisonBandSection() {
  return (
    <section
      className="section ground-inverse"
      id="comparison"
      style={{ '--hm': 2 }}
      aria-labelledby="compare-h"
    >
      <div className="wrap">
        <div className="section-head">
          <h2 id="compare-h">Compare resume screening across three approaches</h2>
          <p className="measure">
            Evaluate deterministic four-pillar math alongside boolean filters and prompt-based scorers.
          </p>
        </div>

        <div
          className="ui ui-panel fill"
          style={{
            padding: '24px',
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg, 20px)',
            border: '1px solid var(--line)',
          }}
        >
          <table className="table smartats-compare-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th scope="col" style={{ padding: '12px 12px 14px 0', fontWeight: 500, color: 'var(--muted)' }}>
                  Criterion
                </th>
                <th scope="col" style={{ padding: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                  Boolean filter
                </th>
                <th scope="col" style={{ padding: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                  Opaque prompt scorer
                </th>
                <th scope="col" style={{ padding: '12px 0 14px 12px', fontWeight: 600, color: 'var(--ink)' }}>
                  SmartATS
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.criterion} style={{ borderTop: '1px solid var(--line)' }}>
                  <th scope="row" style={{ padding: '16px 12px 16px 0', fontWeight: 500 }}>
                    {row.criterion}
                  </th>
                  <td data-col="Boolean filter" style={{ padding: '16px 12px', color: 'var(--muted)' }}>
                    {row.boolean}
                  </td>
                  <td data-col="Opaque prompt scorer" style={{ padding: '16px 12px', color: 'var(--muted)' }}>
                    {row.llm}
                  </td>
                  <td data-col="SmartATS" style={{ padding: '16px 0 16px 12px', color: 'var(--ink)', fontWeight: 500 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0, color: '#52a670' }}>
                        <path d="m3.5 8.5 2.8 2.8 6.2-6.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{row.smartats}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
