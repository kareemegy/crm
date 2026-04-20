/**
 * Simple prev/next pagination bar. Stateless — parent owns `page`.
 *
 * Props:
 *   page      : 1-indexed current page
 *   pageSize  : rows per page
 *   total     : total row count (after filtering)
 *   onChange  : (nextPage) => void
 *   className : optional extra classes for the wrapper
 */
export default function Pagination({ page, pageSize, total, onChange, className = '' }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onChange(next);
  };

  return (
    <div className={`flex items-center justify-between mt-3 ${className}`}>
      <div className="text-[12px] text-ink-muted dark:text-night-muted tabular-nums">
        {total === 0 ? 'No results' : <>Showing <span className="font-medium text-ink-text dark:text-night-text">{from}–{to}</span> of {total}</>}
      </div>

      <div className="flex items-center gap-1">
        <PageButton disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
          <ChevronIcon className="w-3.5 h-3.5 rotate-180" />
        </PageButton>

        <span className="px-2 text-[12px] text-ink-muted dark:text-night-muted tabular-nums">
          Page <span className="font-medium text-ink-text dark:text-night-text">{page}</span> of {totalPages}
        </span>

        <PageButton disabled={page >= totalPages} onClick={() => go(page + 1)} aria-label="Next page">
          <ChevronIcon className="w-3.5 h-3.5" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ disabled, onClick, children, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md
                 text-ink-muted dark:text-night-muted
                 hover:bg-ink-surface dark:hover:bg-night-raised
                 disabled:opacity-40 disabled:cursor-not-allowed
                 active:scale-[0.92] transition-all duration-150"
      {...props}
    >
      {children}
    </button>
  );
}

function ChevronIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m9 18 6-6-6-6"/>
  </svg>); }
