import { useEffect, useMemo, useRef, useState } from 'react';
import { todayISO } from '../../lib/format.js';

/**
 * On-brand date picker: a click-to-open popover calendar matched to the
 * app's accent theme. Past dates are disabled; quick-pick row jumps to
 * Today / Tomorrow / +1 week for one-click scheduling.
 *
 * Props:
 *   value       : ISO 'YYYY-MM-DD' or '' (uncontrolled clear returns '')
 *   onChange    : (iso) => void
 *   placeholder : shown when empty
 */
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const pad  = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function DatePicker({ value = '', onChange, placeholder = 'Pick a date' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = todayISO();

  const [viewDate, setViewDate] = useState(() => {
    const d = parseISO(value) || today;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Jump the view to the selected month each time the popover opens.
  useEffect(() => {
    if (!open) return;
    const d = parseISO(value) || today;
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [open]); // eslint-disable-line

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey   = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown',   onKey);
    };
  }, [open]);

  // 42-cell grid starting from Sunday of the week containing the 1st.
  const days = useMemo(() => {
    const start = new Date(viewDate);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewDate]);

  const viewIsCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth();

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const pick = (d) => {
    if (d < today) return;
    onChange(toISO(d));
    setOpen(false);
  };

  const goMonth = (delta) =>
    setViewDate(v => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  const displayValue = value
    ? parseISO(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const tomorrow = () => { const t = new Date(today); t.setDate(t.getDate() + 1); pick(t); };
  const nextWeek = () => { const t = new Date(today); t.setDate(t.getDate() + 7); pick(t); };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full h-9 px-3 rounded-md text-[13.5px] text-left
                    bg-white border border-ink-border
                    dark:bg-night-raised dark:border-night-border
                    focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20
                    hover:border-ink-muted/40 dark:hover:border-night-muted/40
                    transition-all duration-150 flex items-center justify-between gap-2
                    ${value ? 'text-ink-text dark:text-night-text'
                            : 'text-ink-muted dark:text-night-muted'}
                    ${open ? 'border-accent-500 ring-2 ring-accent-500/20' : ''}`}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <CalendarIcon className="w-4 h-4 text-ink-muted dark:text-night-muted shrink-0" />
      </button>

      {open && (
        <div
          role="dialog"
          // Stop mousedown from bubbling so the outside-click handler never
          // treats any in-popover interaction as a reason to close.
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute z-40 mt-1.5 left-0 w-[300px]
                     rounded-xl shadow-popup overflow-hidden p-3 origin-top-left
                     bg-ink-bg dark:bg-night-surface
                     border border-ink-border dark:border-night-border
                     animate-scale-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              disabled={viewIsCurrentMonth}
              onClick={() => goMonth(-1)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md
                         text-ink-muted dark:text-night-muted
                         hover:bg-ink-surface dark:hover:bg-night-raised
                         disabled:opacity-25 disabled:cursor-not-allowed
                         transition-colors active:scale-[0.9]"
              aria-label="Previous month"
            >
              <ChevronIcon className="w-3.5 h-3.5 rotate-180" />
            </button>
            <div className="text-[13px] font-semibold capitalize">{monthLabel}</div>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md
                         text-ink-muted dark:text-night-muted
                         hover:bg-ink-surface dark:hover:bg-night-raised
                         transition-colors active:scale-[0.9]"
              aria-label="Next month"
            >
              <ChevronIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1 text-[10.5px] uppercase tracking-wide
                          text-ink-muted dark:text-night-muted text-center font-medium">
            {WEEKDAYS.map(w => <div key={w} className="py-1">{w.slice(0, 2)}</div>)}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              const iso           = toISO(d);
              const disabled      = d < today;
              const isSelected    = value === iso;
              const isToday       = iso === todayStr;
              const isOtherMonth  = d.getMonth() !== viewDate.getMonth();
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  className={[
                    'h-8 rounded-md text-[13px] tabular-nums transition-all duration-100',
                    !disabled && 'active:scale-[0.9]',
                    isSelected
                      ? 'bg-gradient-to-br from-accent-500 to-accent-700 text-white font-semibold shadow-soft'
                      : isToday
                        ? 'text-accent-600 dark:text-accent-400 font-semibold ring-1 ring-accent-500/50'
                        : isOtherMonth
                          ? 'text-ink-muted/60 dark:text-night-muted/50'
                          : 'text-ink-text dark:text-night-text',
                    !disabled && !isSelected && 'hover:bg-ink-surface dark:hover:bg-night-raised',
                    disabled && 'opacity-25 cursor-not-allowed'
                  ].filter(Boolean).join(' ')}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick picks */}
          <div className="mt-3 pt-3 border-t border-ink-border dark:border-night-border
                          flex items-center flex-wrap gap-1.5">
            <QuickPick onClick={() => pick(today)}>Today</QuickPick>
            <QuickPick onClick={tomorrow}>Tomorrow</QuickPick>
            <QuickPick onClick={nextWeek}>+1 week</QuickPick>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="ml-auto text-[11.5px] px-2 h-6 rounded
                           text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
                           transition-colors active:scale-[0.95]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickPick({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11.5px] px-2 h-6 rounded
                 bg-ink-surface hover:bg-white border border-ink-border
                 dark:bg-night-raised dark:hover:bg-night-surface dark:border-night-border
                 text-ink-text dark:text-night-text
                 transition-colors active:scale-[0.95]"
    >
      {children}
    </button>
  );
}

function CalendarIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>); }
function ChevronIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m9 18 6-6-6-6"/>
  </svg>); }
