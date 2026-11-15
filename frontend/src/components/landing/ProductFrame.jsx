import { Lock } from 'lucide-react';

export default function ProductFrame({
  url = 'smartats.app/studio/leaderboard',
  children,
  className = '',
  contentClassName = '',
  rightAction = null,
}) {
  return (
    <div
      className={`rounded-[14px] border border-line bg-surface shadow-md overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="px-4 py-2.5 bg-surface-alt border-b border-line flex items-center justify-between gap-4 select-none">
        {/* Window controls (three dots) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-[6px] bg-surface border border-line text-[13px] text-ink-muted tabular-nums">
            <Lock className="w-3.5 h-3.5 text-champagne shrink-0" strokeWidth={1.75} />
            <span className="truncate">{url}</span>
          </div>
        </div>

        {/* Right Action / Spacer to balance three dots */}
        <div className="flex items-center justify-end shrink-0 w-12">
          {rightAction || <div className="w-2 h-2" />}
        </div>
      </div>

      {/* Frame Body */}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

export { ProductFrame };
