import { useEffect, useState } from 'react';

// Live date + time header. Time refreshes every 30 seconds so the minute stays
// accurate without thrashing React. Uses the browser locale.
export default function CurrentDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="inline-flex items-center gap-3 rounded-xl px-4 py-2.5 animate-fade-in
                    bg-ink-bg dark:bg-night-surface
                    border border-ink-border dark:border-night-border
                    shadow-soft">
      <div className="h-9 w-9 shrink-0 rounded-lg
                      bg-gradient-to-br from-accent-500 to-accent-700 text-white
                      flex items-center justify-center">
        <CalendarIcon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[15px] font-semibold leading-tight tracking-tight">
          {dayName}
        </div>
        <div className="text-[13px] text-ink-muted dark:text-night-muted tabular-nums mt-0.5">
          {timeStr}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>); }
