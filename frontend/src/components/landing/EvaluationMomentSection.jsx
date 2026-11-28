const ROLE_RUNS = [
  { role: 'Senior Backend Engineer', time: '3.12 ms', score: '1.000 NDCG@3', width: '100%' },
  { role: 'Full-Stack Developer', time: '3.45 ms', score: '1.000 NDCG@3', width: '96%' },
  { role: 'ML Platform Engineer', time: '3.56 ms', score: '1.000 NDCG@3', width: '94%' },
  { role: 'Aggregate benchmark average', time: '3.38 ms', score: '98.8% macro F1', width: '99%' },
];

export function EvaluationMomentSection() {
  return (
    <section
      className="section ground-surface"
      id="evaluation"
      data-moment="line-carries-colour"
      data-moment-opts='{"from":"base"}'
      aria-labelledby="eval-h"
    >
      <div className="wrap grid fill" style={{ alignItems: 'stretch' }}>
        <div className="span-5 split-col">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2 id="eval-h">Benchmarked on 8 resumes across 3 roles</h2>
            <p>
              Verified against annotated backend and full-stack profiles running synchronously on local CPU.
            </p>
          </div>
          <p className="t-body split-col__end">
            Scanned image PDFs require local Tesseract binaries, and current skill aliases target English CVs.
          </p>
        </div>

        <div className="span-6 start-7" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ul className="rows">
            <li>
              <span className="rows__name">
                Email and phone recall
                <small>Normalized extraction across multi-column PDFs</small>
              </span>
              <span className="rows__value mono">100.0%</span>
            </li>
            <li>
              <span className="rows__name">
                Skill extraction macro F1
                <small>Canonical taxonomy alias resolution</small>
              </span>
              <span className="rows__value mono">98.8%</span>
            </li>
            <li>
              <span className="rows__name">
                Ranking alignment vs rubric
                <small>Top-3 candidate order across test roles</small>
              </span>
              <span className="rows__value mono">1.000 NDCG@3</span>
            </li>
            <li>
              <span className="rows__name">
                End-to-end scoring latency
                <small>CPU execution with zero external API roundtrips</small>
              </span>
              <span className="rows__value mono">3.38 ms / file</span>
            </li>
            <li>
              <span className="rows__name">
                Supported document uploads
                <small>PyMuPDF, python-docx, and plain text parsers</small>
              </span>
              <span className="rows__value mono">PDF · DOCX · TXT</span>
            </li>
            <li>
              <span className="rows__name">
                Duplicate file protection
                <small>SHA-256 content hash check prior to queueing</small>
              </span>
              <span className="rows__value mono">100% skip</span>
            </li>
          </ul>

          <div
            className="ui ui-panel"
            style={{
              padding: '20px',
              background: 'var(--p-bg)',
              borderRadius: 'var(--r-md, 12px)',
              border: '1px solid var(--line)',
              display: 'grid',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 }}>
              <span>Evaluation fixture breakdown</span>
              <span className="mono" style={{ color: 'var(--accent)' }}>24 profile-role pairs</span>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {ROLE_RUNS.map((item) => (
                <div key={item.role} style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>{item.role}</span>
                    <span className="mono" style={{ color: 'var(--u-muted)' }}>
                      {item.time} · {item.score}
                    </span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--p-surface)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', width: item.width, height: '100%', background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
