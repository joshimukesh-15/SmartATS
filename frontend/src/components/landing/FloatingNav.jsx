import { Link } from 'react-router-dom';

export function FloatingNav({ onEnterApp }) {
  return (
    <header className="nav">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">
          Skip to content
        </a>

        <a className="nav__logo" href="#top">
          <span className="mark" data-mark="dots" aria-hidden="true" />
          SmartATS
        </a>

        <nav className="nav__links" aria-label="Main">
          <div className="nav__item">
            <a className="nav__link" href="#workspace">
              Product
              <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div className="nav__menu">
              <div className="wrap">
                <div className="grid">
                  <a className="menu-card span-4" href="#workspace">
                    <div className="panel" aria-hidden="true">
                      <div className="stage stage--fade-b">
                        <div className="at-corner fit" style={{ '--ax': '16px', '--ay': '16px', '--fit-max': '320px' }}>
                          <div className="ui ui-panel ui-checks" style={{ padding: '12px' }}>
                            <div className="ui-checks__head">
                              <div className="ui-title">Senior Backend Rank</div>
                              <span className="ui-meta">94 pts</span>
                            </div>
                            <div className="ui-checks__bar">
                              <i style={{ '--k': '0.94' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <strong>Workspace</strong>
                    <span className="muted t-small">Inspect four-pillar scores and missing skill flags live.</span>
                  </a>

                  <a className="menu-card span-4 start-5" href="#pipeline">
                    <div className="panel" aria-hidden="true">
                      <div className="stage stage--fade-b">
                        <div className="at-corner fit" style={{ '--ax': '16px', '--ay': '16px', '--fit-max': '320px' }}>
                          <div className="ui ui-panel" style={{ padding: '12px', display: 'grid', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
                              <img src="/assets/icons/pdf.svg" alt="" width="18" height="18" />
                              <span>Meyer_CV.pdf</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
                              <img src="/assets/icons/docx.svg" alt="" width="18" height="18" />
                              <span>Chen_Systems.docx</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <strong>Document intake</strong>
                    <span className="muted t-small">PyMuPDF, python-docx, Tesseract OCR, and SHA-256 hashes.</span>
                  </a>

                  <a className="menu-card span-4 start-9" href="#evaluation">
                    <div className="panel" aria-hidden="true">
                      <div className="stage stage--fade-b">
                        <div className="at-corner fit" style={{ '--ax': '16px', '--ay': '16px', '--fit-max': '320px' }}>
                          <div className="ui ui-panel" style={{ padding: '12px', display: 'grid', gap: '4px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>98.8% weighted F1</div>
                            <div style={{ fontSize: '13px', color: 'var(--u-muted)' }}>1.000 NDCG@3 · 3.38 ms / file</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <strong>Evaluation</strong>
                    <span className="muted t-small">Verified benchmark precision across annotated roles.</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="nav__item">
            <a className="nav__link" href="#pipeline">
              Pipeline
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="#comparison">
              Compare
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href="#faq">
              FAQ
            </a>
          </div>
        </nav>

        <div className="nav__actions">
          <Link className="nav__link" to="/login">
            Sign in
          </Link>
          <button type="button" className="btn btn--primary" onClick={onEnterApp}>
            Open the studio
          </button>
        </div>

        <button
          className="nav__toggle"
          type="button"
          aria-expanded="false"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
