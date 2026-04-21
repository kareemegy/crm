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

const EMPTY = { name: '', email: '', role: '' };

export default function Employees() {
  const { data, loading, refetch } = useAsync(api.employees.list, []);
  const employees = data || [];
  const confirm = useConfirm();

  const [q, setQ]               = useState('');
  const [roleF, setRoleF]       = useState('');
  const [editing, setEditing]   = useState(null);
  const [creating, setCreating] = useState(false);

  // Distinct role values become filter options.
  const roleOptions = Array.from(new Set(employees.map(e => e.role).filter(Boolean)))
    .map(r => ({ value: r, label: r }));

  const filtered = employees.filter(e => {
    if (roleF && e.role !== roleF) return false;
    if (q) {
      const hay = `${e.name} ${e.email || ''} ${e.role || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const remove = async (row) => {
    const ok = await confirm({
      title: 'Delete employee?',
      description: `"${row.name}" will be removed. Projects assigned to them will become unassigned.`,
      confirmLabel: 'Delete employee',
      destructive: true
    });
    if (!ok) return;
    await api.employees.remove(row.id);
    refetch();
  };

  const columns = [
    { key: 'name',  header: 'Name',
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-white
                          flex items-center justify-center text-[11px] font-semibold">
            {initials(r.name)}
          </div>
          <span className="font-medium">{r.name}</span>
        </div>
      )},
    { key: 'role',  header: 'Role',
      render: r => r.role  || <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'email', header: 'Email',
      render: r => r.email || <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'actions', header: '', className: 'text-right',
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
        title="Employees"
        subtitle="Team members available for client assignments."
        actions={<Button onClick={() => setCreating(true)}>+ New Employee</Button>}
      />

      <TableToolbar
        search={q} onSearch={setQ}
        placeholder="Search name, email, role…"
        onReset={() => { setQ(''); setRoleF(''); }}
        count={`${filtered.length} of ${employees.length} shown`}
        filters={roleOptions.length
          ? [{ label: 'Role', value: roleF, onChange: setRoleF, options: roleOptions }]
          : []
        }
      />

      {loading ? <Skeleton />
               : <DataTable columns={columns} rows={filtered}
                            defaultSort={{ key: 'name', dir: 'asc' }}
                            emptyMessage="No employees yet." />}

      <EmployeeModal
        open={creating}
        title="New Employee"
        onClose={() => setCreating(false)}
        onSubmit={async (d) => { await api.employees.create(d); setCreating(false); refetch(); }}
      />
      <EmployeeModal
        open={!!editing}
        title="Edit Employee"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={async (d) => { await api.employees.update(editing.id, d); setEditing(null); refetch(); }}
      />
    </div>
  );
}

function EmployeeModal({ open, title, initial, onClose, onSubmit }) {
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setForm(initial
      ? { name: initial.name, email: initial.email || '', role: initial.role || '' }
      : EMPTY);
  }, [initial, open]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try { await onSubmit({ ...form, name: form.name.trim() }); }
    catch (err) { setError(err.message); }
    finally    { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name *">
          <Input autoFocus required value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Role">
          <Input value={form.role} onChange={set('role')} placeholder="Designer, PM, Developer…" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set('email')} />
        </Field>
        {error && <p className="text-[13px] text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !form.name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?';
}
