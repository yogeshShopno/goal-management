import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, footer, panelClassName = '' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-[var(--color-text)]/25 backdrop-blur-sm transition-opacity"
        onClick={() => onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${panelClassName || 'max-w-lg'} rounded-xl bg-[var(--color-card)] p-0 shadow-modal transition-all duration-150 sm:w-auto min-[320px]:w-[95%]`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
