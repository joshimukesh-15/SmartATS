export function FeaturesGridSection() {
  return (
    <section className="section" id="pipeline" style={{ '--hm': 2 }} aria-labelledby="pipeline-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="pipeline-h">Resume intake and role weight steps</h2>
          <p className="measure">
            Extract clean text once, skip duplicate binaries by hash, and adjust pillar multipliers per role.
          </p>
        </div>

        <div className="grid fill">
          {/* Card 1: Multi-format parsing + SHA-256 deduplication */}
          <article className="card card--row span-6">
            <h3>Parses PDF, Word, and image scans</h3>
            <p>
              Runs PyMuPDF, python-docx, and Tesseract OCR while flagging SHA-256 duplicates on upload.
            </p>
            <div className="panel" data-fx="gradient-mesh" style={{ '--p-h': '300px' }}>
              <div className="stage stage--fade-br" style={{ '--fade-h': '32px' }}>
                <div
                  className="at-corner wide"
                  style={{ '--ax': '24px', '--ay': '24px', '--w': '560px' }}
                  data-ui-loop=""
                >
                  <div
                    className="ui ui-files"
                    data-ui="files"
                    data-reading="Indexing resume {n} of {total}"
                  >
                    <div className="ui-files__status" style={{ borderRadius: '6px' }}>
                      <span className="ui-dot" />
                      <span data-files-status="">8 resumes indexed</span>
                    </div>
                    <ul className="ui-files__grid">
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/pdf.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Meyer.pdf</span>
                        <span className="ui-file__kind">PyMuPDF</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/docx.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Chen.docx</span>
                        <span className="ui-file__kind">python-docx</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/pdf.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Nowak.pdf</span>
                        <span className="ui-file__kind">PyMuPDF</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/docx.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Nair.docx</span>
                        <span className="ui-file__kind">python-docx</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/python.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Taxonomy</span>
                        <span className="ui-file__kind">Aliases</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/fastapi.svg" alt="" />
                        </span>
                        <span className="ui-file__name">SHA-256</span>
                        <span className="ui-file__kind">FastAPI</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/postgres.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Store</span>
                        <span className="ui-file__kind">Postgres</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                      <li className="ui-file is-done">
                        <span className="ui-file__icon">
                          <img src="/assets/icons/pdf.svg" alt="" />
                        </span>
                        <span className="ui-file__name">Scan.pdf</span>
                        <span className="ui-file__kind">Tesseract</span>
                        <span className="ui-file__bar">
                          <i />
                        </span>
                        <span className="ui-file__check">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 2: Per-role weight controls (held still) */}
          <article className="card card--row span-6 start-7">
            <h3>Re-weight pillars per requisition</h3>
            <p>
              Tune skills, text, tenure, and degree weights per role without re-uploading a single file.
            </p>
            <div className="panel" style={{ '--p-h': '300px' }}>
              <div className="stage stage--fade-b" style={{ '--fade-h': '28px' }}>
                <div className="at-right" style={{ '--ax': '28px', '--ay': '24px', '--ay-sm': '20px' }}>
                  <div className="ui ui-panel ui-toggles" data-ui="toggles">
                    <div className="ui-head">
                      <svg className="ui-icon ui-toggles__ico" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M8 1.8 13 4v3.6c0 3-2.1 5.4-5 6.6-2.9-1.2-5-3.6-5-6.6V4z" />
                        <path d="m5.8 8 1.6 1.6 3-3.2" />
                      </svg>
                      <div className="ui-title">Role scoring rules</div>
                      <span className="ui-spacer" />
                      <div className="ui-meta" data-tg-count="">
                        4 of 4 on
                      </div>
                    </div>
                    <ul className="ui-toggles__list">
                      <li className="ui-tg">
                        <span className="ui-tg__text">
                          <span className="ui-tg__label">Required skills coverage</span>
                          <span className="ui-tg__sub">40% weight · alias map</span>
                        </span>
                        <button
                          className="ui-switch is-on"
                          type="button"
                          role="switch"
                          aria-checked="true"
                          aria-label="Required skills coverage"
                        >
                          <i />
                        </button>
                      </li>
                      <li className="ui-tg">
                        <span className="ui-tg__text">
                          <span className="ui-tg__label">Experience tenure window</span>
                          <span className="ui-tg__sub">25% weight · date spans</span>
                        </span>
                        <button
                          className="ui-switch is-on"
                          type="button"
                          role="switch"
                          aria-checked="true"
                          aria-label="Experience tenure window"
                        >
                          <i />
                        </button>
                      </li>
                      <li className="ui-tg">
                        <span className="ui-tg__text">
                          <span className="ui-tg__label">TF-IDF lexical similarity</span>
                          <span className="ui-tg__sub">20% weight · scikit-learn</span>
                        </span>
                        <button
                          className="ui-switch is-on"
                          type="button"
                          role="switch"
                          aria-checked="true"
                          aria-label="TF-IDF lexical similarity"
                        >
                          <i />
                        </button>
                      </li>
                      <li className="ui-tg">
                        <span className="ui-tg__text">
                          <span className="ui-tg__label">Degree tier check</span>
                          <span className="ui-tg__sub">15% weight · BSc to PhD</span>
                        </span>
                        <button
                          className="ui-switch is-on"
                          type="button"
                          role="switch"
                          aria-checked="true"
                          aria-label="Degree tier check"
                        >
                          <i />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
