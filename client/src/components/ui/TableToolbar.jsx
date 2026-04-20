import { Input, Select } from './Field.jsx';
import Button from './Button.jsx';

/**
 * Toolbar for tables. Any currently-applied search/filter gets an accent
 * outline so the user can tell at a glance that the visible rows are being
 * narrowed. A banner line below makes it extra hard to miss, with an inline
 * "Clear" action.
 */
export default function TableToolbar({
  search = '', onSearch, placeholder = 'Search…',
  filters = [], onReset, count
}) {
  const activeFilters   = filters.filter(f => f.value);
  const anyFilterActive = !!search || activeFilters.length > 0;

  return (
    <div className="mb-3 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <SearchIcon
            className={`w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              search ? 'text-accent-600 dark:text-accent-500'
                     : 'text-ink-muted dark:text-night-muted'
            }`}
          />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearch?.(e.target.value)}
            active={!!search}
            className={`pl-8 ${search ? 'pr-8' : ''} w-64`}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch?.('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md
                         inline-flex items-center justify-center
                         text-ink-muted dark:text-night-muted
                         hover:bg-ink-surface dark:hover:bg-night-raised
                         active:scale-[0.9] transition-all"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {filters.map((f, i) => (
          <div key={i} className="min-w-[150px]">
            <Select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              active={!!f.value}
            >
              <option value="">{f.label}: All</option>
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        ))}

        {anyFilterActive && onReset && (
          <Button variant="ghost" onClick={onReset}>Clear all</Button>
        )}

        {count && (
          <div className="ml-auto text-[12px] text-ink-muted dark:text-night-muted">
            {count}
          </div>
        )}
      </div>

      {/* Active-state banner so the filter state is unmistakable. */}
      {anyFilterActive && (
        <div className="mt-2 flex items-center gap-2 flex-wrap animate-slide-up
                        text-[12px] text-accent-700 dark:text-accent-300">
          <FunnelIcon className="w-3.5 h-3.5" />
          <span className="font-medium">Showing filtered results</span>
          {search && (
            <Chip onRemove={() => onSearch?.('')} label="search" value={`"${search}"`} />
          )}
          {activeFilters.map((f, i) => {
            const opt = f.options.find(o => String(o.value) === String(f.value));
            return (
              <Chip key={i}
                    onRemove={() => f.onChange('')}
                    label={f.label}
                    value={opt?.label ?? f.value} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ label, value, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                     bg-accent-50 text-accent-700 border border-accent-200
                     dark:bg-accent-500/10 dark:text-accent-300 dark:border-accent-500/30">
      <span className="text-ink-muted dark:text-night-muted uppercase tracking-wide text-[10px]">{label}</span>
      <span className="font-medium">{value}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}
              className="ml-0.5 hover:opacity-70 active:scale-90 transition">
        <XIcon className="w-3 h-3" />
      </button>
    </span>
  );
}

function SearchIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
  </svg>); }
function XIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>); }
function FunnelIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"/>
  </svg>); }
