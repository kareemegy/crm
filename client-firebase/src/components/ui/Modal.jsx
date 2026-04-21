import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent body scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative ${maxWidth} w-full max-h-[90vh] overflow-hidden
                    rounded-xl shadow-popup
                    bg-ink-bg dark:bg-night-surface
                    border border-ink-border dark:border-night-border
                    animate-scale-in`}
      >
        <div className="flex items-center justify-between px-5 py-3
                        border-b border-ink-border dark:border-night-border
                        bg-ink-bg dark:bg-night-surface">
          <h2 className="font-semibold text-[15px]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md
                       text-ink-muted dark:text-night-muted
                       hover:bg-ink-surface dark:hover:bg-night-raised
                       active:scale-[0.92] transition-all duration-150"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-auto max-h-[calc(90vh-56px)]">{children}</div>
      </div>
    </div>
  );
}
