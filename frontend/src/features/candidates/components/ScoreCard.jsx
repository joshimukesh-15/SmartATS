export default function ScoreCard({
  candidate,
  breakdown,
  parts,
  insights,
}) {
  const finalScore = Number(breakdown.finalScore || 0).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Score breakdown card */}
      <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
        <h3 className="text-[17px] font-semibold text-ink">Score breakdown</h3>
        <p className="mt-1 mb-4 text-[14px] text-ink-muted">
          Final score is the sum of weighted points from four parts.
        </p>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[56px] font-semibold leading-none tracking-[-0.045em] tabular-nums text-ink">
            {finalScore}
          </span>
          <span className="text-[14px] text-ink-muted">out of 100 points</span>
        </div>

        <div className="my-5 flex h-3 overflow-hidden rounded-full bg-surface-alt">
          {parts.map((p) => (
            <i
              key={p.name}
              style={{ width: `${Math.min(Math.max(p.points, 0), 100)}%` }}
              className={`block h-full transition-[width] duration-500 ease-out ${p.barClass}`}
              title={`${p.name}: ${p.points.toFixed(1)} pts`}
            />
          ))}
        </div>

        <div className="mt-2">
          <div className="grid grid-cols-[minmax(0,1.4fr)_55px_65px_70px] lg:grid-cols-[1.4fr_70px_90px_1.6fr_80px] items-center gap-3 py-2 text-[13px] text-ink-muted">
            <span>Part</span>
            <span>Weight</span>
            <span>Match</span>
            <span className="hidden lg:block"></span>
            <span className="text-right">Points</span>
          </div>
          {parts.map((p) => (
            <div
              key={p.name}
              className="grid grid-cols-[minmax(0,1.4fr)_55px_65px_70px] lg:grid-cols-[1.4fr_70px_90px_1.6fr_80px] items-center gap-3 border-t border-line py-3.5 text-[14px]"
            >
              <div className="flex min-w-0 items-center font-semibold text-ink">
                <span className={`mr-2.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${p.dotClass}`} />
                <span className="truncate">{p.name}</span>
              </div>
              <span className="tabular-nums text-ink-muted">{p.weight}%</span>
              <span className="tabular-nums text-ink-muted">{p.match.toFixed(1)}%</span>
              <div className="hidden h-1.5 overflow-hidden rounded-full bg-surface-alt lg:block">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${p.barClass}`}
                  style={{ width: `${Math.min(Math.max(p.match, 0), 100)}%` }}
                />
              </div>
              <span className="text-right font-semibold tabular-nums text-ink">{p.points.toFixed(1)}</span>
            </div>
          ))}
        </div>

        <details className="mt-5 rounded-xl border border-line bg-surface-alt/40 px-3.5 py-2.5 text-[13px] text-ink-muted">
          <summary className="cursor-pointer font-medium text-ink">Scoring explanation</summary>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-[13px]">
            {candidate.score_explanation || breakdown.formulaSummary || 'Each pillar score is multiplied by its configured weight to calculate the total.'}
          </p>
        </details>
      </div>

      {/* Strengths & Gaps (Hidden when empty, no placeholder cards) */}
      {(insights.strengths.length > 0 || insights.gaps.length > 0) && (
        <div
          className={`grid grid-cols-1 ${
            insights.strengths.length > 0 && insights.gaps.length > 0 ? 'md:grid-cols-2' : ''
          } gap-5`}
        >
          {insights.strengths.length > 0 && (
            <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
              <h3 className="text-[17px] font-semibold text-ink">Strengths</h3>
              <p className="mt-1 mb-4 text-[13px] text-ink-muted">From parts scoring 80% or more.</p>
              <ul className="space-y-2.5 text-[14px] text-ink">
                {insights.strengths.map((str) => (
                  <li key={str} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.gaps.length > 0 && (
            <div className="rounded-[14px] border border-line bg-surface p-6 shadow-xs">
              <h3 className="text-[17px] font-semibold text-ink">Gaps to review</h3>
              <p className="mt-1 mb-4 text-[13px] text-ink-muted">From parts scoring under 40%.</p>
              <ul className="space-y-2.5 text-[14px] text-ink">
                {insights.gaps.map((gap) => (
                  <li key={gap} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-champagne" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
