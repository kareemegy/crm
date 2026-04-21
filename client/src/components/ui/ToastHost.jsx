import { useEffect, useState } from 'react';

// Stacked toast container. Listens for `toast:show` window events so any
// module (including the SSE realtime layer) can fire a toast without wiring
// a shared context.
export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onShow(e) {
      const id = Date.now() + Math.random();
      setToasts(t => [...t, { id, ...e.detail }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    }
    window.addEventListener('toast:show', onShow);
    return () => window.removeEventListener('toast:show', onShow);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white backdrop-blur animate-fade-in
            ${t.kind === 'warn' ? 'bg-amber-500/90' : 'bg-sky-600/90'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
