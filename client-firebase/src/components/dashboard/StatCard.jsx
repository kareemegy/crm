import { money } from '../../lib/format.js';

// Notion-style: neutral card with a subtle colored accent dot + icon.
// Hover lifts it very slightly.
const tones = {
  emerald: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  amber:   { dot: 'bg-amber-500',   text: 'text-amber-600   dark:text-amber-400'   },
  rose:    { dot: 'bg-rose-500',    text: 'text-rose-600    dark:text-rose-400'    }
};

export default function StatCard({ title, value, subtitle, tone = 'emerald', icon: Icon }) {
  const t = tones[tone];
  return (
    <div className="group relative rounded-xl p-5
                    bg-ink-bg dark:bg-night-surface
                    border border-ink-border dark:border-night-border
                    shadow-soft hover:shadow-popup
                    transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${t.dot}`} />
          <span className="text-[12px] font-medium text-ink-muted dark:text-night-muted">
            {title}
          </span>
        </div>
        {Icon && <Icon className={`w-4 h-4 ${t.text}`} />}
      </div>

      <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
        {money(value)}
      </div>

      {subtitle && (
        <div className="mt-1 text-[12px] text-ink-muted dark:text-night-muted">
          {subtitle}
        </div>
      )}
    </div>
  );
}
