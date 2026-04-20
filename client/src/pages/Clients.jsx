import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import ClientTable from '../components/clients/ClientTable.jsx';
import ClientFormModal from '../components/clients/ClientFormModal.jsx';
import Button from '../components/ui/Button.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import TableToolbar from '../components/ui/TableToolbar.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { Skeleton, ErrorText } from './Dashboard.jsx';

const PENDING_OPTIONS = [
  { value: 'yes', label: 'Has pending balance' },
  { value: 'no',  label: 'Fully paid / none' }
];

export default function Clients() {
  const { data, loading, error, refetch } = useAsync(api.clients.list, []);
  const clients = data || [];
  const confirm = useConfirm();

  const [q, setQ]             = useState('');
  const [pendingF, setPending]= useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const refresh = () => refetch();
    window.addEventListener('clients:changed',  refresh);
    window.addEventListener('videos:changed',   refresh);
    window.addEventListener('projects:changed', refresh);
    return () => {
      window.removeEventListener('clients:changed',  refresh);
      window.removeEventListener('videos:changed',   refresh);
      window.removeEventListener('projects:changed', refresh);
    };
  }, [refetch]);

  const filtered = useMemo(() => clients.filter(c => {
    if (pendingF === 'yes' && !(c.pending_value > 0)) return false;
    if (pendingF === 'no'  &&  (c.pending_value > 0)) return false;
    if (q) {
      const hay = `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [clients, q, pendingF]);

  const onDelete = async (client) => {
    const ok = await confirm({
      title: 'Delete client?',
      description: `"${client.name}" and all ${client.project_count} associated project(s) will be permanently removed. This action can't be undone.`,
      confirmLabel: 'Delete client',
      destructive: true
    });
    if (!ok) return;
    await api.clients.remove(client.id);
    refetch();
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Contacts with their project totals."
        actions={<Button onClick={() => setCreating(true)}>+ New Client</Button>}
      />

      <TableToolbar
        search={q} onSearch={setQ}
        placeholder="Search name, email, phone…"
        onReset={() => { setQ(''); setPending(''); }}
        count={`${filtered.length} of ${clients.length} shown`}
        filters={[
          { label: 'Balance', value: pendingF, onChange: setPending, options: PENDING_OPTIONS }
        ]}
      />

      {loading && <Skeleton />}
      {error   && <ErrorText text={error.message} />}
      {!loading && !error && (
        <ClientTable clients={filtered} onEdit={setEditing} onDelete={onDelete} />
      )}

      <ClientFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => { setCreating(false); refetch(); }}
      />
      <ClientFormModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); refetch(); }}
      />
    </div>
  );
}
