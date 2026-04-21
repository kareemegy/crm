import { useMemo, useState } from 'react';

/**
 * Generic table driven by a `columns` descriptor.
 *   columns: [{ key, header, render?, className?, sortable?, sortValue? }]
 *     - sortable  : set false to opt a column out (actions column, etc).
 *                   Default true.
 *     - sortValue : (row) => comparable. Default row[column.key].
 *   defaultSort  : { key, dir } — dir is 'asc' | 'desc'
 *
 * Sort state lives locally; clicking a sortable header toggles direction or
 * switches the active column.
 */
export default function DataTable({
  columns, rows, emptyMessage = 'No data.', defaultSort = null
}) {
  const [sort, setSort] = useState(defaultSort); // { key, dir } | null

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find(c => c.key === sort.key);
    if (!col) return rows;
    const extract = col.sortValue || ((r) => r[col.key]);
    const dir = sort.dir === 'desc' ? -1 : 1;

    return [...rows].sort((a, b) => {
      const av = extract(a);
      const bv = extract(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;   // nulls last
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key) => {
    setSort(s => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc')     return { key, dir: 'desc' };
      return null; // third click clears
    });
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-soft
                    bg-ink-bg dark:bg-night-surface
                    border border-ink-border dark:border-night-border">
      <div className="overflow-x-auto">
      <table className="w-full text-[13.5px] min-w-[680px]">
        <thead>
          <tr className="border-b border-ink-border dark:border-night-border
                         bg-ink-surface/70 dark:bg-night-raised/50">
            {columns.map(c => {
              const isSortable = c.sortable !== false && !!c.key && c.key !== 'actions';
              const active = sort?.key === c.key;
              return (
                <th key={c.key}
                    className={`text-left font-medium px-4 py-2.5
                                text-[11.5px] uppercase tracking-wide
                                ${active
                                  ? 'text-accent-700 dark:text-accent-300 bg-accent-50/60 dark:bg-accent-500/10'
                                  : 'text-ink-muted dark:text-night-muted'}
                                ${c.className || ''}
                                ${isSortable ? 'cursor-pointer select-none hover:text-ink-text dark:hover:text-night-text' : ''}`}
                    onClick={isSortable ? () => toggleSort(c.key) : undefined}>
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {isSortable && (
                      <SortIcon dir={active ? sort.dir : null}
                                className={active ? 'text-accent-600 dark:text-accent-400' : 'opacity-40'} />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 && (
            <tr>
              <td colSpan={columns.length}
                  className="px-4 py-10 text-center text-ink-muted dark:text-night-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
          {sortedRows.map((row, i) => (
            <tr key={row.id ?? i}
                className="border-t border-ink-border/60 dark:border-night-border/60
                           hover:bg-ink-surface/60 dark:hover:bg-night-raised/40
                           transition-colors">
              {columns.map(c => (
                <td key={c.key} className={`px-4 py-2.5 align-middle ${c.className || ''}`}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function SortIcon({ dir, className = '' }) {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" className={className}>
      <path d="M3 5 6 2l3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"
            opacity={dir === 'desc' ? 0.3 : 1} />
      <path d="M3 7 6 10l3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"
            opacity={dir === 'asc' ? 0.3 : 1} />
    </svg>
  );
}
