export function HeroSection({ onEnterApp }) {
  return (
    <section className="hero hero--triptych bg-mist" data-enter="" aria-labelledby="hero-h">
      <div className="wrap">
        <div className="hero-text grid hero__grid">
          <div className="span-3">
            <h1 id="hero-h">Resume screening for hiring teams</h1>
            <p className="hero__lead">
              Four weighted pillars score PDF and Word resumes in 3.4 ms per file on your own server.
            </p>
          </div>

          <div className="ly-collage span-6 start-4" aria-label="SmartATS scoring views">
            {/* Set 1 */}
            <div className="ly-collage__set is-on">
              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '0%',
                  top: '2%',
                  width: '58%',
                  height: '46%',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}>
                  <span>Ranked shortlist</span>
                  <span className="mono" style={{ color: 'var(--accent)' }}>4 pillars</span>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: 'var(--p-bg)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>Hannah Meyer</span>
                    <strong className="mono">94%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: 'var(--p-bg)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>David Chen</span>
                    <strong className="mono">82%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: 'var(--p-bg)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>Tomasz Nowak</span>
                    <strong className="mono">74%</strong>
                  </div>
                </div>
              </div>

              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '61%',
                  top: '6%',
                  width: '39%',
                  height: '42%',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Weights</span>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 8px', margin: 0, fontSize: '13px' }}>
                  <dt style={{ color: 'var(--u-muted)' }}>Skills</dt>
                  <dd className="mono" style={{ margin: 0, fontWeight: 600, color: 'var(--accent)' }}>40%</dd>
                  <dt style={{ color: 'var(--u-muted)' }}>Tenure</dt>
                  <dd className="mono" style={{ margin: 0 }}>25%</dd>
                  <dt style={{ color: 'var(--u-muted)' }}>TF-IDF</dt>
                  <dd className="mono" style={{ margin: 0 }}>20%</dd>
                  <dt style={{ color: 'var(--u-muted)' }}>Degree</dt>
                  <dd className="mono" style={{ margin: 0 }}>15%</dd>
                </dl>
              </div>

              <div
                className="ly-piece ui ui-panel ui-stat"
                style={{
                  left: '0%',
                  top: '52%',
                  width: '96%',
                  height: '44%',
                  padding: '18px 56px 18px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/assets/icons/pdf.svg" alt="" width="22" height="22" />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Meyer_Staff_CV.pdf</span>
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--accent)' }}>3.38 ms</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', fontSize: '13px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--p-bg)' }}>
                    <span style={{ display: 'block', color: 'var(--u-muted)' }}>Parser</span>
                    <span style={{ fontWeight: 500 }}>PyMuPDF</span>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--p-bg)' }}>
                    <span style={{ display: 'block', color: 'var(--u-muted)' }}>Hash</span>
                    <span className="mono" style={{ fontWeight: 500 }}>SHA-256</span>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--p-bg)' }}>
                    <span style={{ display: 'block', color: 'var(--u-muted)' }}>Match</span>
                    <span className="mono" style={{ fontWeight: 500 }}>6 / 6</span>
                  </div>
                </div>
                <svg viewBox="0 0 360 32" style={{ width: '100%', height: '32px' }} aria-hidden="true">
                  <rect x="0" y="6" width="144" height="12" rx="3" fill="#1f6b3a" />
                  <rect x="148" y="6" width="90" height="12" rx="3" fill="#2b2b2b" />
                  <rect x="242" y="6" width="72" height="12" rx="3" fill="#737373" />
                  <rect x="318" y="6" width="42" height="12" rx="3" fill="#d4d4d4" />
                </svg>
              </div>
            </div>

            {/* Set 2 */}
            <div className="ly-collage__set">
              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '0%',
                  top: '4%',
                  width: '57%',
                  height: '44%',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Intake queue</span>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', background: 'var(--p-bg)' }}>
                    <img src="/assets/icons/pdf.svg" alt="" width="18" height="18" />
                    <span>PDF text · PyMuPDF</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', background: 'var(--p-bg)' }}>
                    <img src="/assets/icons/docx.svg" alt="" width="18" height="18" />
                    <span>Word · python-docx</span>
                  </div>
                </div>
              </div>

              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '61%',
                  top: '8%',
                  width: '39%',
                  height: '40%',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Dedup</span>
                <div className="mono" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>
                  SHA-256 skip
                </div>
                <span style={{ fontSize: '13px', color: 'var(--u-muted)' }}>Zero duplicate parses</span>
              </div>

              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '0%',
                  top: '52%',
                  width: '96%',
                  height: '44%',
                  padding: '18px 56px 18px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span>Normalized contact fields</span>
                  <span className="mono" style={{ color: 'var(--accent)' }}>100% recall</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--u-muted)' }}>
                  Extracts emails, phone numbers, degrees, and date-span tenure directly into PostgreSQL.
                </p>
              </div>
            </div>

            {/* Set 3 */}
            <div className="ly-collage__set">
              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '0%',
                  top: '4%',
                  width: '57%',
                  height: '44%',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Local stack</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src="/assets/icons/python.svg" alt="" width="24" height="24" />
                  <img src="/assets/icons/fastapi.svg" alt="" width="24" height="24" />
                  <img src="/assets/icons/react.svg" alt="" width="24" height="24" />
                  <img src="/assets/icons/postgres.svg" alt="" width="24" height="24" />
                </div>
              </div>

              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '61%',
                  top: '8%',
                  width: '39%',
                  height: '40%',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Benchmark</span>
                <div className="mono" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>
                  98.8% F1
                </div>
                <span style={{ fontSize: '13px', color: 'var(--u-muted)' }}>1.000 NDCG@3</span>
              </div>

              <div
                className="ly-piece ui ui-panel"
                style={{
                  left: '0%',
                  top: '52%',
                  width: '96%',
                  height: '44%',
                  padding: '18px 56px 18px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span>Zero third-party API calls</span>
                  <span className="mono" style={{ color: 'var(--accent)' }}>Self-hosted</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--u-muted)' }}>
                  Runs inside local FastAPI and Docker with identical rank order on every rerun.
                </p>
              </div>
            </div>
          </div>

          <div className="hero__cta span-3 start-10">
            <button type="button" className="btn btn--primary" onClick={onEnterApp}>
              Open the studio
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
