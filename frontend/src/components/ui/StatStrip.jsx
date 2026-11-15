export function StatStrip({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <div
      className={`rounded-[14px] border border-line bg-surface grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-line ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="p-5 sm:p-6 space-y-1">
          <div className="text-[13px] text-ink-muted font-medium">{item.label}</div>
          <div className="text-[28px] sm:text-[32px] font-semibold text-ink leading-tight tabular-nums">
            {item.value}
          </div>
          {item.caption && <div className="text-[13px] text-ink-subtle">{item.caption}</div>}
        </div>
      ))}
    </div>
  );
}
