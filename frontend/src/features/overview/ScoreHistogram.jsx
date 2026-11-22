import { Panel } from '../../components/ui';

export default function ScoreHistogram({ histogramBuckets, totalEvaluated, maxBucketCount }) {
  return (
    <Panel className="lg:col-span-6 p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Score Distribution</h2>
          <p className="text-[13px] text-ink-muted mt-0.5">6-tier candidate fit histogram</p>
        </div>
        <span className="text-[13px] font-semibold text-ink tabular-nums bg-surface-alt px-2 py-0.5 rounded-[8px] border border-line">
          {totalEvaluated} {totalEvaluated === 1 ? 'evaluation' : 'evaluations'}
        </span>
      </div>

      {totalEvaluated === 0 ? (
        <div className="py-12 text-center text-[13px] text-ink-muted">
          No candidate evaluations yet to display score distribution.
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {/* 6 Vertical Bars */}
          <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-36 pt-4 pb-2 border-b border-line">
            {histogramBuckets.map((bucket) => {
              const fillPercent =
                bucket.count > 0
                  ? Math.max(Math.round((bucket.count / maxBucketCount) * 100), 12)
                  : 0;

              return (
                <div key={bucket.label} className="flex flex-col items-center justify-end h-full gap-1.5">
                  {/* Tabular Count */}
                  <span className="text-[13px] font-semibold tabular-nums text-ink">
                    {bucket.count > 0 ? bucket.count : '—'}
                  </span>

                  {/* Bar Track & Fill */}
                  <div className="w-full h-24 bg-surface-alt/50 rounded-[6px] p-0.5 flex items-end justify-center">
                    <div
                      style={{ height: `${fillPercent}%` }}
                      className={`w-full rounded-[4px] transition-all duration-500 ${
                        bucket.tone === 'high'
                          ? 'bg-primary'
                          : bucket.tone === 'mid'
                            ? 'bg-slate-steel'
                            : 'bg-platinum dark:bg-ink-subtle/50'
                      }`}
                      title={`${bucket.label}: ${bucket.count} candidate(s)`}
                    />
                  </div>

                  {/* Bucket Label */}
                  <span className="text-[13px] font-medium text-ink-muted text-center leading-none pt-1">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[13px] text-ink-muted pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[2px] bg-primary" />
              <span>80%–100% Fit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[2px] bg-slate-steel" />
              <span>60%–79% Moderate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[2px] bg-platinum dark:bg-ink-subtle/50" />
              <span>&lt;60% Review</span>
            </span>
          </div>
        </div>
      )}
    </Panel>
  );
}
