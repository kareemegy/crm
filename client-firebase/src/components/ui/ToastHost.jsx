import { useEffect, useState } from 'react';

// Stacked toast container. Listens for `toast:show` window events so any
// module (realtime, error handlers, forms) can raise a toast without wiring
// a shared context.
//
// kinds: 'info' (default, sky), 'warn' (amber), 'error' (rose).
const KIND_CLASS = {
  info:  'bg-sky-600/90',
  warn:  'bg-amber-500/90',
  error: 'bg-rose-600/95'
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onShow(e) {
      const id = Date.now() + Math.random();
      setToasts(t => [...t, { id, ...e.detail }]);
      const ttl = e.detail?.kind === 'error' ? 6000 : 4000;
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
    }
    window.addEventListener('toast:show', onShow);
    return () => window.removeEventListener('toast:show', onShow);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white backdrop-blur animate-fade-in
            ${KIND_CLASS[t.kind] || KIND_CLASS.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
