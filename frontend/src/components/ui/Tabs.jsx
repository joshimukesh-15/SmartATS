export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 rounded-[10px] bg-surface-alt border border-line ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary ${
              isActive
                ? 'bg-surface text-ink border border-line/60 shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
