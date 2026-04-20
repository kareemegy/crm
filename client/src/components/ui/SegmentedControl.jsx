import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Segmented control with a **sliding pill** that animates between options
 * instead of snapping. We measure the active button's position/width with a
 * ref and drive an absolutely-positioned indicator with CSS transitions.
 *
 *   options : [{ value, label, count? }]
 *   value   : currently-active value
 *   onChange: (value) => void
 */
export default function SegmentedControl({ options, value, onChange }) {
  const wrapRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // useLayoutEffect runs before paint so the indicator never flashes at 0.
  useLayoutEffect(() => {
    const btn = btnRefs.current[value];
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [value, options.length]);

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex p-0.5 rounded-md
                 bg-ink-surface dark:bg-night-raised
                 border border-ink-border dark:border-night-border"
    >
      {/* Sliding indicator. Transitions `left` and `width` smoothly. */}
      <div
        aria-hidden
        className="absolute top-0.5 bottom-0.5 rounded pointer-events-none
                   bg-gradient-to-br from-accent-500 to-accent-700
                   shadow-popup ring-2 ring-accent-500/30"
        style={{
          left:  indicator.left,
          width: indicator.width,
          transition: 'left 280ms cubic-bezier(0.4, 0, 0.2, 1), width 280ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { btnRefs.current[o.value] = el; }}
            type="button"
            onClick={() => onChange(o.value)}
            className={`
              relative z-10 inline-flex items-center gap-1.5 px-3.5 h-8 rounded text-[13px] font-semibold
              transition-colors duration-200 active:scale-[0.97]
              ${active
                ? 'text-white'
                : 'text-ink-muted dark:text-night-muted hover:text-ink-text dark:hover:text-night-text'}
            `}
          >
            {o.label}
            {o.count != null && (
              <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full
                                text-[11px] font-medium tabular-nums transition-colors duration-200
                                ${active
                                  ? 'bg-white/20 text-white'
                                  : 'bg-ink-bg dark:bg-night-surface'}`}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
