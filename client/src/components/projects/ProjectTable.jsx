import { Link } from 'react-router-dom';
import DataTable from '../ui/DataTable.jsx';
import Button from '../ui/Button.jsx';
import { money, shortDate, statusBadgeClass } from '../../lib/format.js';

export default function ProjectTable({
  projects, onEdit, onDelete,
  showClient = true, emptyMessage = 'No projects yet.'
}) {
  const columns = [
    { key: 'name', header: 'Project',
      sortValue: r => r.name,
      render: r => (
        <Link
          to={`/projects/${r.id}`}
          className="font-medium text-ink-text dark:text-night-text hover:underline decoration-accent-500 decoration-2 underline-offset-2"
        >
          {r.name}
        </Link>
      )},
    ...(showClient ? [{ key: 'client_name', header: 'Client',
      render: r => r.client_id
        ? <Link to={`/clients/${r.client_id}`}
                className="text-ink-muted dark:text-night-muted hover:text-ink-text dark:hover:text-night-text hover:underline">
            {r.client_name}
          </Link>
        : <span className="text-ink-muted dark:text-night-muted">—</span>
    }] : []),
    { key: 'category_name', header: 'Category',
      render: r => r.category_name || <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'assignee_name', header: 'Assignee',
      render: r => r.assignee_name || <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'video_count', header: 'NOV',
      sortValue: r => r.video_count,
      render: r => (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full
                         bg-ink-surface dark:bg-night-raised
                         text-[12px] font-medium tabular-nums">
          {r.video_count}
        </span>
      )},
    { key: 'price', header: 'Price',
      sortValue: r => r.price,
      render: r => <span className="tabular-nums">{money(r.price)}</span> },
    { key: 'status', header: 'Status',
      render: r => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${statusBadgeClass(r.status)}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.status}
        </span>
      )},
    { key: 'delivery_date', header: 'Delivery',
      sortValue: r => r.delivery_date,
      render: r => <span className="tabular-nums text-ink-muted dark:text-night-muted">{shortDate(r.delivery_date)}</span> },
    { key: 'actions', header: '', className: 'text-right', sortable: false,
      render: r => (
        <div className="flex justify-end gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          {onEdit   && <Button variant="ghost"  onClick={() => onEdit(r)}>Edit</Button>}
          {onDelete && <Button variant="danger" onClick={() => onDelete(r)}>Delete</Button>}
        </div>
      )}
  ];
  return <DataTable columns={columns} rows={projects} emptyMessage={emptyMessage} />;
}
