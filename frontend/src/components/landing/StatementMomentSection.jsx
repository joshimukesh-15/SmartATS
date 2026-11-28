export function StatementMomentSection() {
  return (
    <section
      className="section statement"
      id="statement"
      data-moment="word-highlight"
      aria-label="Scoring principle"
    >
      <div className="wrap" style={{ justifyContent: 'center' }}>
        <p className="t-label muted" style={{ marginBottom: '24px' }}>
          Scoring guarantee
        </p>
        <p className="mo-wh__text">
          Hiring teams never defend a mystery score in a debrief. Every ranked row records{' '}
          <strong>the exact skills, words, and tenure</strong> behind each point.
        </p>
      </div>
    </section>
  );
}
