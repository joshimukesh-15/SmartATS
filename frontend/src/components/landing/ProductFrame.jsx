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
      className={`rounded-[16px] border border-line bg-surface shadow-[0_24px_60px_-15px_rgba(11,19,43,0.18)] dark:shadow-[0_24px_60px_-15px_rgba(4,8,20,0.75)] overflow-hidden transition-all duration-300 ring-1 ring-cadet-steel/15 dark:ring-ice-cyan/15 ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="px-4 py-3 bg-surface-alt/70 backdrop-blur-xs border-b border-line flex items-center justify-between gap-4 select-none">
        {/* Window controls (three dots) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 border border-rose-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 border border-amber-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 border border-emerald-500/30" />
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-[8px] bg-surface border border-line text-[13px] font-medium text-ink-muted tabular-nums shadow-xs">
            <Lock className="w-3 h-3 text-ink-muted shrink-0" strokeWidth={2} />
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
