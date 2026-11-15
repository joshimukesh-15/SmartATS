export default function SelectionBar({
  selectedCount = 0,
  onCompare,
  onClear,
}) {
  if (selectedCount < 2) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-on-primary px-5 py-3 rounded-[12px] shadow-2xl flex items-center gap-4 border border-line animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="text-[13px] font-medium">
        {selectedCount} candidates selected
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCompare}
          className="px-3 py-1.5 rounded-[8px] bg-champagne text-ink text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Compare
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-2 py-1.5 text-[13px] text-on-primary/80 hover:text-on-primary cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
