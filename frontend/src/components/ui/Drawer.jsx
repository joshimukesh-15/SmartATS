import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  maxWidth = 'max-w-2xl',
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sideClasses = {
    right: `right-0 top-0 bottom-0 w-full ${maxWidth} border-l border-line`,
    left: 'left-0 top-0 bottom-0 w-full max-w-xs border-r border-line',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed bg-surface text-ink shadow-2xl flex flex-col z-10 ${
          sideClasses[side] || sideClasses.right
        } ${className}`}
      >
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-alt/40">
          <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1 rounded-[6px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
