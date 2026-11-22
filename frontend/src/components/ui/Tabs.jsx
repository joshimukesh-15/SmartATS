export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  const handleKeyDown = (e, currentIdx) => {
    let nextIdx = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = (currentIdx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = tabs.length - 1;
    }
    if (nextIdx !== null) {
      e.preventDefault();
      onChange(tabs[nextIdx].id);
      const tabElements = e.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
      tabElements?.[nextIdx]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 rounded-[10px] bg-surface-alt border border-line ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, idx)}
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
