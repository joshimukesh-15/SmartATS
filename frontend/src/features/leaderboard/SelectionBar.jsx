export default function SelectionBar({
  selectedCount = 0,
  onCompare,
  onClear,
}) {
  if (selectedCount < 2) return null;

  return (
    <aside aria-label="Candidate selection toolbar" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 h-10 px-4 rounded-full bg-zinc-900 dark:bg-surface text-zinc-100 border border-zinc-800 dark:border-line shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
      <span className="text-[13px] font-medium tabular-nums">
        {selectedCount} candidates selected
      </span>
      <span className="w-[1px] h-3.5 bg-zinc-700 dark:bg-line" />
      <button
        type="button"
        onClick={onCompare}
        className="px-3 py-1 rounded-full bg-champagne text-ink text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
      >
        Compare
      </button>
      <button
        type="button"
        onClick={onClear}
        className="text-[13px] text-zinc-400 hover:text-white dark:hover:text-ink transition-colors cursor-pointer"
      >
        Clear
      </button>
    </aside>
  );
}
