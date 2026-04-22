import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/api.js';
import DataTable from '../ui/DataTable.jsx';
import Button from '../ui/Button.jsx';
import { Input, Select } from '../ui/Field.jsx';
import TableToolbar from '../ui/TableToolbar.jsx';
import StatusActions from '../ui/StatusActions.jsx';
import { useConfirm } from '../ui/ConfirmDialog.jsx';
import InlineCreatableSelect from '../clients/InlineCreatableSelect.jsx';
import { money, statusBadgeClass } from '../../lib/format.js';

const STATUSES = ['Completed', 'Deposit', 'Pending'];

/**
 * Project services (Reel / Podcast / Design / Script / Long Video / …).
 * Each service row has: title, service type, quantity, price (total),
 * payment_status, deposit_paid, notes. Project totals + NOV are aggregated
 * server-side from these rows.
 */
export default function VideoSection({ projectId }) {
  const [videos, setVideos]             = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [adding, setAdding]             = useState(false);
  const [editing, setEditing]           = useState(null);
  const [q, setQ]                       = useState('');
  const [statusF, setStatusF]           = useState('');
  const [typeF, setTypeF]               = useState('');
  const confirm                         = useConfirm();

  const load = async () => {
    setLoading(true);
    try { setVideos(await api.videos.listByProject(projectId)); }
    finally { setLoading(false); }
  };
  const loadServiceTypes = async () => setServiceTypes(await api.serviceTypes.list());

  useEffect(() => { load(); }, [projectId]);
  useEffect(() => { loadServiceTypes(); }, []);

  const notify = () => window.dispatchEvent(new CustomEvent('videos:changed'));

  const removeVideo = async (v) => {
    const ok = await confirm({
      title: 'Delete service?',
      description: `"${v.name}" will be removed. The project's total price and services count will update accordingly.`,
      confirmLabel: 'Delete service',
      destructive: true
    });
    if (!ok) return;
    await api.videos.remove(v.id);
    await load(); notify();
  };

  const changeVideoStatus = async (v, nextStatus) => {
    await api.videos.update(v.id, {
      name:            v.name,
      service_type_id: v.service_type_id,
      quantity:        v.quantity,
      price:           v.price,
      payment_status:  nextStatus,
      deposit_paid:    nextStatus === 'Deposit' ? v.deposit_paid : 0,
      notes:           v.notes
    });
    await load(); notify();
  };

  const addDeposit = async (v, amount) => {
    const nextDeposit = Number(v.deposit_paid || 0) + Number(amount);
    const clamped     = Math.min(nextDeposit, v.price);
    const fullyPaid   = clamped >= Number(v.price) - 0.0001;
    await api.videos.update(v.id, {
      name:            v.name,
      service_type_id: v.service_type_id,
      quantity:        v.quantity,
      price:           v.price,
      payment_status:  fullyPaid ? 'Completed' : 'Deposit',
      deposit_paid:    fullyPaid ? 0 : clamped,
      notes:           v.notes
    });
    await load(); notify();
  };

  const filtered = useMemo(() => videos.filter(v => {
    if (statusF && v.payment_status !== statusF)                    return false;
    if (typeF   && String(v.service_type_id ?? '') !== typeF)       return false;
    if (q) {
      const hay = `${v.name} ${v.notes || ''} ${v.service_type_name || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [videos, q, statusF, typeF]);

  const total    = videos.reduce((sum, v) => sum + Number(v.price    || 0), 0);
  const totalQty = videos.reduce((sum, v) => sum + Number(v.quantity || 0), 0);

  const columns = [
    { key: 'name', header: 'Title',
      render: r => <span className="font-medium">{r.name}</span> },
    { key: 'service_type_name', header: 'Type',
      sortValue: r => r.service_type_name || '',
      render: r => r.service_type_name
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-medium
                           bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
            {r.service_type_name}
          </span>
        : <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'quantity', header: 'Qty',
      sortValue: r => r.quantity,
      render: r => (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full
                         bg-ink-surface dark:bg-night-raised
                         text-[12px] font-medium tabular-nums">
          {r.quantity}
        </span>
      )},
    { key: 'price', header: 'Price',
      sortValue: r => r.price,
      render: r => <span className="tabular-nums">{money(r.price)}</span> },
    { key: 'deposit_paid', header: 'Paid',
      sortValue: r => r.deposit_paid ?? 0,
      render: r => {
        if (r.payment_status === 'Completed') return <span className="tabular-nums text-emerald-600 dark:text-emerald-400">{money(r.price)}</span>;
        if (r.payment_status === 'Deposit')   return <span className="tabular-nums text-amber-600 dark:text-amber-400">{money(r.deposit_paid)}</span>;
        return <span className="text-ink-muted dark:text-night-muted">—</span>;
      }},
    { key: 'payment_status', header: 'Status',
      render: r => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${statusBadgeClass(r.payment_status)}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.payment_status}
        </span>
      )},
    { key: 'notes', header: 'Notes',
      render: r => r.notes || <span className="text-ink-muted dark:text-night-muted">—</span> },
    { key: 'actions', header: '', className: 'text-right', sortable: false,
      render: r => {
        const remaining = Math.max(
          Number(r.price) - (r.payment_status === 'Deposit' ? Number(r.deposit_paid || 0) : 0),
          0
        );
        return (
          <div className="flex justify-end items-start gap-2 flex-wrap">
            <StatusActions
              value={r.payment_status}
              remaining={remaining}
              onChange={(next) => changeVideoStatus(r, next)}
              onAddDeposit={(amount) => addDeposit(r, amount)}
            />
            <div className="flex gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
              <Button variant="ghost"  onClick={() => setEditing(r)}>Edit</Button>
              <Button variant="danger" onClick={() => removeVideo(r)}>Delete</Button>
            </div>
          </div>
        );
      }}
  ];

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between mb-3 flex-wrap gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Services</h2>
          <p className="text-[12px] text-ink-muted dark:text-night-muted mt-0.5">
            Each service line contributes to the project's total price and services count.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted">
              Total · {totalQty} {totalQty === 1 ? 'service' : 'services'}
            </div>
            <div className="text-[14px] font-semibold tabular-nums">{money(total)}</div>
          </div>
          <Button onClick={() => { setAdding(true); setEditing(null); }}>+ Add Service</Button>
        </div>
      </div>

      {adding && (
        <ServiceInlineForm
          serviceTypes={serviceTypes}
          reloadServiceTypes={loadServiceTypes}
          onCancel={() => setAdding(false)}
          onSubmit={async (data) => {
            await api.videos.create(projectId, data);
            setAdding(false); await load(); notify();
          }}
        />
      )}
      {editing && (
        <ServiceInlineForm
          serviceTypes={serviceTypes}
          reloadServiceTypes={loadServiceTypes}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={async (data) => {
            await api.videos.update(editing.id, data);
            setEditing(null); await load(); notify();
          }}
        />
      )}

      <TableToolbar
        search={q}
        onSearch={setQ}
        placeholder="Search services…"
        onReset={() => { setQ(''); setStatusF(''); setTypeF(''); }}
        count={`${filtered.length} of ${videos.length} shown`}
        filters={[
          { label: 'Type',   value: typeF,   onChange: setTypeF,
            options: serviceTypes.map(t => ({ value: String(t.id), label: t.name })) },
          { label: 'Status', value: statusF, onChange: setStatusF,
            options: STATUSES.map(s => ({ value: s, label: s })) }
        ]}
      />

      {loading
        ? <div className="h-12 rounded-md animate-pulse bg-ink-surface dark:bg-night-raised/60" />
        : <DataTable columns={columns} rows={filtered}
                     emptyMessage="No services yet. Add one to start building the project price." />}
    </section>
  );
}

function ServiceInlineForm({ initial = null, serviceTypes = [], reloadServiceTypes, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    name:            initial?.name            ?? '',
    service_type_id: initial?.service_type_id ? String(initial.service_type_id) : '',
    quantity:        initial?.quantity        ?? 1,
    price:           initial?.price           ?? '',
    payment_status:  initial?.payment_status  ?? 'Pending',
    deposit_paid:    initial?.deposit_paid    ?? '',
    notes:           initial?.notes           ?? ''
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const isDeposit = form.payment_status === 'Deposit';

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Service title is required'); return; }
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 1) { setError('Quantity must be a whole number ≥ 1'); return; }
    const priceN   = form.price        === '' ? 0 : Number(form.price);
    const depositN = form.deposit_paid === '' ? 0 : Number(form.deposit_paid);
    if (isDeposit && depositN > priceN) { setError("Deposit can't be larger than the total price"); return; }
    setSaving(true); setError(null);
    try {
      await onSubmit({
        name:            form.name.trim(),
        service_type_id: form.service_type_id || null,
        quantity:        qty,
        price:           priceN,
        payment_status:  form.payment_status,
        deposit_paid:    isDeposit ? depositN : 0,
        notes:           form.notes || null
      });
    } catch (err) { setError(err.message); }
    finally      { setSaving(false); }
  };

  return (
    <form onSubmit={submit}
          className="mb-3 p-4 rounded-xl animate-slide-up space-y-3
                     bg-gradient-to-b from-ink-surface to-ink-surface/60
                     dark:from-night-raised dark:to-night-raised/40
                     border-2 border-ink-border/80 dark:border-night-border/70
                     shadow-lg shadow-black/5 dark:shadow-black/30
                     ring-1 ring-black/5 dark:ring-white/5">
      {/* Row 1: title (full) */}
      <Input placeholder="Service title" autoFocus
             value={form.name}  onChange={set('name')}
             className="w-full" />

      {/* Row 2: type · qty · price */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
        <div className="sm:col-span-3">
          <InlineCreatableSelect
            value={form.service_type_id}
            onChange={(v) => setForm(f => ({ ...f, service_type_id: v }))}
            options={serviceTypes}
            onCreate={(data) => api.serviceTypes.create(data)}
            onCreated={reloadServiceTypes}
            createLabel="Add Type"
            placeholder="Service type…"
          />
        </div>
        <Input placeholder="Qty" type="number" min="1" step="1"
               value={form.quantity} onChange={set('quantity')}
               className="sm:col-span-1" />
        <Input placeholder="Total price" type="number" min="0" step="0.01"
               value={form.price} onChange={set('price')}
               className="sm:col-span-2" />
      </div>

      {/* Row 3: status · deposit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Select value={form.payment_status} onChange={set('payment_status')}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        {isDeposit && (
          <Input placeholder="Deposit paid" type="number" min="0" step="0.01"
                 value={form.deposit_paid} onChange={set('deposit_paid')}
                 className="animate-slide-up" />
        )}
      </div>

      {/* Row 4: notes */}
      <Input placeholder="Notes (optional)"
             value={form.notes} onChange={set('notes')}
             className="w-full" />

      <div className="flex justify-end gap-1.5 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save' : 'Add Service'}
        </Button>
      </div>

      {error && <p className="text-[12px] text-rose-500">{error}</p>}
    </form>
  );
}
