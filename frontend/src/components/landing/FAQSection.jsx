const FAQS = [
  {
    q: 'How are the 4 scoring pillars weighted?',
    a: 'Default weighting assigns 40% to required skill coverage, 25% to experience tenure, 20% to scikit-learn TF-IDF similarity, and 15% to education degree tier.',
  },
  {
    q: 'Does resume data stay inside our local server?',
    a: 'Yes. Parsing, scikit-learn vectorization, and PostgreSQL persistence execute inside your own Docker stack without external inference APIs.',
  },
  {
    q: 'What happens when a resume is uploaded twice?',
    a: 'SmartATS computes a SHA-256 hash on incoming bytes. Exact duplicates bypass redundant parsing while keeping existing records intact.',
  },
  {
    q: 'How does resume OCR read scanned PDFs?',
    a: 'PyMuPDF extracts text layers first. When extracted characters fall below threshold, the intake worker invokes local Tesseract OCR.',
  },
];

const RUNTIME_CHECKS = [
  { icon: '/assets/icons/ui-file-text.svg', label: 'PyMuPDF & DOCX parsers', status: 'Local worker' },
  { icon: '/assets/icons/ui-shield-check.svg', label: 'SHA-256 duplicate skip', status: 'Before queue' },
  { icon: '/assets/icons/ui-sliders-horizontal.svg', label: 'Four-pillar rubric math', status: 'Deterministic' },
  { icon: '/assets/icons/docker.svg', label: 'Postgres & FastAPI stack', status: 'Self-hosted' },
];

export function FAQSection() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-h">
      <div className="wrap grid grid--top fill">
        <div className="span-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2 id="faq-h">Questions hiring teams ask about screening</h2>
            <p>Operational details on file parsing, local hosting, and deterministic scoring math.</p>
          </div>

          <div
            className="ui ui-checklist"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md, 12px)',
              padding: '16px 20px',
              display: 'grid',
              gap: '12px',
            }}
          >
            {RUNTIME_CHECKS.map((check) => (
              <div
                key={check.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '14px',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--ink)', fontWeight: 500 }}>
                  <img src={check.icon} alt="" width="18" height="18" style={{ flexShrink: 0 }} />
                  <span>{check.label}</span>
                </span>
                <span className="mono" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="span-6 start-7">
          <div className="faq">
            {FAQS.map((item) => (
              <div key={item.q} className="faq__item">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
