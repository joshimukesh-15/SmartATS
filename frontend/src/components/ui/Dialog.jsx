import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  maxWidth = 'max-w-xl',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!isInDialog) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className={`fixed inset-0 m-auto bg-surface border border-line rounded-[14px] w-full ${maxWidth} p-0 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop:bg-ink/40 backdrop:backdrop-blur-xs ${className}`}
    >
      <div className="flex flex-col max-h-[90vh]">
        {(title || onClose) && (
          <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-alt/40">
            <div>
              {title && <h3 className="text-[17px] font-semibold text-ink">{title}</h3>}
              {description && <p className="text-[13px] text-ink-muted mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1 rounded-[6px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
