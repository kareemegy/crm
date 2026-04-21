import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * Imperative confirm dialog. Mount <ConfirmProvider> at the app root and call
 * `const confirm = useConfirm()` anywhere. `await confirm({...})` returns true
 * if the user confirms, false otherwise.
 *
 * Options:
 *   title         : heading text
 *   description   : body copy
 *   confirmLabel  : primary button label (default "Confirm")
 *   cancelLabel   : secondary button label (default "Cancel")
 *   destructive   : red confirm button + warning icon (default false)
 */
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, opts: null });
  const resolverRef = useRef(null);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setState({ open: true, opts });
  }), []);

  const settle = (result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(s => ({ ...s, open: false }));
  };

  const opts = state.opts || {};
  const destructive = !!opts.destructive;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={state.open}
        onClose={() => settle(false)}
        title={opts.title || 'Are you sure?'}
        maxWidth="max-w-md"
      >
        <div className="flex gap-4">
          {destructive && (
            <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                            bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400
                            animate-scale-in">
              <AlertIcon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {opts.description && (
              <p className="text-[13.5px] text-ink-muted dark:text-night-muted leading-relaxed">
                {opts.description}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => settle(false)}>
                {opts.cancelLabel || 'Cancel'}
              </Button>
              <Button
                variant={destructive ? 'danger' : 'primary'}
                onClick={() => settle(true)}
              >
                {opts.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error('useConfirm must be used within a ConfirmProvider');
  return fn;
}

function AlertIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>); }
