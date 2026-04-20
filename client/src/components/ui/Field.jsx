// Shared field wrapper so Input/Select/Textarea look consistent without duplicating label markup.
export function Field({ label, htmlFor, children, hint, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`block ${className}`}>
      {label && (
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-muted dark:text-night-muted mb-1.5">
          {label}
        </span>
      )}
      {children}
      {hint && (
        <span className="block text-[11px] text-ink-muted dark:text-night-muted mt-1">
          {hint}
        </span>
      )}
    </label>
  );
}

const base =
  'w-full h-9 px-3 rounded-md text-[13.5px] ' +
  'bg-white border border-ink-border text-ink-text placeholder:text-ink-muted ' +
  'dark:bg-night-raised dark:border-night-border dark:text-night-text dark:placeholder:text-night-muted ' +
  'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 ' +
  'transition-all duration-150';

// Applied when the field holds an "active" value (a filter is applied).
// Provides a persistent accent outline + soft tint so the user can see at a
// glance that the input is narrowing the results below.
const activeRing =
  'border-accent-500 ring-2 ring-accent-500/25 ' +
  'bg-accent-50/60 dark:bg-accent-500/5 ' +
  'text-ink-text dark:text-night-text font-medium';

const multiline =
  'w-full px-3 py-2 rounded-md text-[13.5px] leading-relaxed ' +
  'bg-white border border-ink-border text-ink-text placeholder:text-ink-muted ' +
  'dark:bg-night-raised dark:border-night-border dark:text-night-text dark:placeholder:text-night-muted ' +
  'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20';

export const Input = ({ active, className = '', ...p }) => (
  <input {...p} className={`${base} ${active ? activeRing : ''} ${className}`} />
);

export const Textarea = ({ className = '', ...p }) => (
  <textarea {...p} className={`${multiline} ${className}`} />
);

export const Select = ({ children, active, className = '', ...p }) => (
  <select
    {...p}
    className={`${base} ${active ? activeRing : ''} appearance-none pr-8 bg-no-repeat bg-[right_0.6rem_center] ${className}`}
    style={{
      backgroundImage:
        'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E")',
      backgroundSize: '1rem'
    }}
  >
    {children}
  </select>
);
