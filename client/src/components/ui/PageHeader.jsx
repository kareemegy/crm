// Consistent page headline used across all pages. Slight fade-in on mount.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start sm:items-end justify-between gap-3 flex-wrap mb-5 sm:mb-6 animate-slide-up">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-ink-muted dark:text-night-muted">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
