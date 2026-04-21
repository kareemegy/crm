import { useEffect, useState } from 'react';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import DataTable from '../components/ui/DataTable.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import TableToolbar from '../components/ui/TableToolbar.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { Skeleton } from './Dashboard.jsx';

export default function ServiceTypes() {
  const { data, loading, refetch } = useAsync(api.serviceTypes.list, []);
  const rows     = data || [];
  const confirm  = useConfirm();

  const [q, setQ]               = useState('');
  const [editing, setEditing]   = useState(null);
  const [creating, setCreating] = useState(false);

  const filtered = rows.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  const remove = async (row) => {
    const ok = await confirm({
      title: 'Delete service type?',
      description: `"${row.name}" will be removed. Existing services with this type will become uncategorized.`,
      confirmLabel: 'Delete service type',
      destructive: true
    });
    if (!ok) return;
    await api.serviceTypes.remove(row.id);
    refetch();
  };

  const columns = [
    { key: 'name',       header: 'Name' },
    { key: 'created_at', header: 'Created',
      render: r => <span className="text-ink-muted dark:text-night-muted tabular-nums">{new Date(r.created_at).toLocaleDateString()}</span> },
    { key: 'actions',    header: '', className: 'text-right', sortable: false,
      render: r => (
        <div className="flex justify-end gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          <Button variant="ghost"  onClick={() => setEditing(r)}>Edit</Button>
          <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
        </div>
      )}
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Manageable service types — e.g. Reel, Podcast, Design, Script, Long Video."
        actions={<Button onClick={() => setCreating(true)}>+ New Service</Button>}
      />

      <TableToolbar
        search={q} onSearch={setQ}
        placeholder="Search services…"
        onReset={() => setQ('')}
        count={`${filtered.length} of ${rows.length} shown`}
      />

      {loading ? <Skeleton />
               : <DataTable columns={columns} rows={filtered}
                            defaultSort={{ key: 'name', dir: 'asc' }}
                            emptyMessage="No service types yet." />}

      <NameOnlyModal
        open={creating}
        title="New Service Type"
        onClose={() => setCreating(false)}
        onSubmit={async (name) => { await api.serviceTypes.create({ name }); setCreating(false); refetch(); }}
      />
      <NameOnlyModal
        open={!!editing}
        title="Edit Service Type"
        initial={editing?.name}
        onClose={() => setEditing(null)}
        onSubmit={async (name) => { await api.serviceTypes.update(editing.id, { name }); setEditing(null); refetch(); }}
      />
    </div>
  );
}

function NameOnlyModal({ open, title, initial = '', onClose, onSubmit }) {
  const [name, setName]     = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => { setName(initial); }, [initial, open]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try { await onSubmit(name.trim()); }
    catch (err) { setError(err.message); }
    finally    { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        {error && <p className="text-[13px] text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
