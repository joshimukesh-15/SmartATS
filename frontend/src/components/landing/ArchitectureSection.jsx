const DIAGRAM_ALT =
  'Uploaded PDF and DOCX resumes pass through FastAPI, score across Skills, TF-IDF, and Tenure, and save ranked results to Postgres.';

const DIAGRAM_SPEC = JSON.stringify({
  layout: 'lanes',
  alt: DIAGRAM_ALT,
  motion: { pulse: 'none' },
  input: {
    label: 'Uploads',
    icon: 'pdf',
    sub: 'PDF / DOCX',
    kindCompact: 'pill',
  },
  core: {
    label: 'FastAPI',
    icon: 'fastapi',
  },
  lanes: [
    {
      label: 'Skills',
      icon: 'python',
      done: true,
      sub: '40%',
      kindCompact: 'pill',
    },
    {
      label: 'TF-IDF',
      icon: 'ui:search',
      done: true,
      sub: '20%',
      kindCompact: 'pill',
    },
    {
      label: 'Tenure',
      icon: 'ui:sliders-horizontal',
      done: true,
      sub: '40%',
      kindCompact: 'pill',
    },
  ],
  output: {
    label: 'Postgres',
    icon: 'postgres',
    done: true,
    kindCompact: 'pill',
  },
});

export function ArchitectureSection() {
  return (
    <section className="section" id="architecture" aria-labelledby="arch-h">
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 id="arch-h">Resume workflow steps from upload to shortlist</h2>
          <p className="measure">
            Every resume runs inside Python, FastAPI, scikit-learn, and PostgreSQL without third-party inference calls.
          </p>
        </div>

        <div className="panel fill">
          <div className="dg" role="img" aria-label={DIAGRAM_ALT} data-diagram={DIAGRAM_SPEC} />
        </div>
      </div>
    </section>
  );
}
