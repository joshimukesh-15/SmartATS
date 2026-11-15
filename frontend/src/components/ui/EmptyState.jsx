export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data matching your query.',
  action,
  icon,
  className = '',
}) {
  return (
    <div
      className={`rounded-[14px] border border-dashed border-line p-10 sm:p-12 text-center bg-surface/50 flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-[12px] bg-surface-alt border border-line flex items-center justify-center text-ink-muted">
        {icon || (
          <svg
            className="w-8 h-8 text-ink-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        )}
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-[17px] font-semibold text-ink leading-[1.35]">{title}</h4>
        <p className="text-[13px] text-ink-muted leading-[1.5]">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
