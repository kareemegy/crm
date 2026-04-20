import { Link } from 'react-router-dom';
import DataTable from '../ui/DataTable.jsx';
import Button from '../ui/Button.jsx';
import { money } from '../../lib/format.js';

export default function ClientTable({ clients, onEdit, onDelete }) {
  const columns = [
    { key: 'name', header: 'Client',
      sortValue: r => r.name,
      render: r => (
        <Link to={`/clients/${r.id}`} className="flex items-center gap-3 group">
          <div className="h-8 w-8 shrink-0 rounded-full
                          bg-gradient-to-br from-accent-500 to-accent-700 text-white
                          flex items-center justify-center text-[12px] font-semibold">
            {initialsOf(r.name)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate group-hover:underline decoration-accent-500 decoration-2 underline-offset-2">
              {r.name}
            </div>
            <div className="text-[12px] text-ink-muted dark:text-night-muted truncate">
              {r.email || '—'}
            </div>
          </div>
        </Link>
      )},
    { key: 'phone', header: 'Phone',
      render: r => r.phone || <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'project_count', header: 'Projects',
      sortValue: r => r.project_count,
      render: r => (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full
                         bg-ink-surface dark:bg-night-raised
                         text-[12px] font-medium tabular-nums">
          {r.project_count}
        </span>
      )},
    { key: 'total_value', header: 'Total Value',
      sortValue: r => r.total_value,
      render: r => <span className="tabular-nums font-medium">{money(r.total_value)}</span> },
    { key: 'pending_value', header: 'Pending',
      sortValue: r => r.pending_value,
      render: r => (
        <span className={`tabular-nums ${r.pending_value > 0 ? 'text-rose-500' : 'text-ink-muted dark:text-night-muted'}`}>
          {money(r.pending_value)}
        </span>
      )},
    { key: 'actions', header: '', className: 'text-right', sortable: false,
      render: r => (
        <div className="flex justify-end gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          {onEdit   && <Button variant="ghost"  onClick={() => onEdit(r)}>Edit</Button>}
          {onDelete && <Button variant="danger" onClick={() => onDelete(r)}>Delete</Button>}
        </div>
      )}
  ];
  return <DataTable columns={columns} rows={clients} emptyMessage="No clients yet." />;
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?';
}
