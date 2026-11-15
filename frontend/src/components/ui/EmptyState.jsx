export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display.',
  action,
  icon,
  className = '',
}) {
  return (
    <div
      className={`rounded-[14px] border border-dashed border-line p-10 sm:p-12 text-center bg-surface/50 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-[10px] bg-surface-alt border border-line flex items-center justify-center text-ink-muted">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-[15px] font-medium text-ink">{title}</h4>
        <p className="text-[13px] text-ink-muted leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
