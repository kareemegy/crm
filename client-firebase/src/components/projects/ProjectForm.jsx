import { useEffect, useState } from 'react';
import { api } from '../../api/api.js';
import { Field, Input, Textarea } from '../ui/Field.jsx';
import Button from '../ui/Button.jsx';
import DatePicker from '../ui/DatePicker.jsx';
import InlineCreatableSelect from '../clients/InlineCreatableSelect.jsx';

const EMPTY = {
  name: '',
  client_id: '',
  category_id: '',
  assignee_id: '',
  delivery_date: '',
  notes: ''
};

/**
 * Project form for create/edit.
 *
 * Inline creates (Add Client / Add Category / Add Employee) are *deferred*:
 * they live in local `pending` state as `temp:*` IDs and only hit the API
 * when the project itself is saved. If the user cancels, nothing is
 * persisted. On save, we resolve every selected `temp:*` id to a real id by
 * creating the underlying record, then submit the project with real ids.
 */
export default function ProjectForm({ initial, lockedClientId, onSaved, onCancel }) {
  const [form, setForm]             = useState(() => toForm(initial, lockedClientId));
  const [clients, setClients]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [pending, setPending]       = useState({ clients: [], categories: [], employees: [] });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => { setForm(toForm(initial, lockedClientId)); }, [initial, lockedClientId]);

  const loadClients    = async () => setClients   (await api.clients.list());
  const loadCategories = async () => setCategories(await api.categories.list());
  const loadEmployees  = async () => setEmployees (await api.employees.list());

  useEffect(() => { loadClients(); loadCategories(); loadEmployees(); }, []);

  const set = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm(f => ({ ...f, [field]: value }));
  };

  // Factory for the inline-create callback used by all three dropdowns.
  // Pushes a `temp:*` record into local `pending` state; the real API call
  // happens at submit time.
  const makeInlineCreate = (bucket) => ({ name }) => {
    const item = { id: `temp:${bucket}:${Date.now()}:${Math.random().toString(16).slice(2, 8)}`, name };
    setPending(p => ({ ...p, [bucket]: [...p[bucket], item] }));
    return item;
  };

  // Merge real options with pending items; pending ones get a "(new)" suffix
  // so the user can see they haven't been saved yet.
  const mergeOptions = (real, bucket) => [
    ...real,
    ...pending[bucket].map(x => ({ id: x.id, name: `${x.name} (new)` }))
  ];

  // Resolve a single temp:* id by creating the underlying record. Returns the
  // real id as a string (consistent with the `Number(...)` step in toPayload).
  const resolveTempId = async (value, bucket, apiNs) => {
    if (!value || !String(value).startsWith('temp:')) return value;
    const temp = pending[bucket].find(t => String(t.id) === String(value));
    if (!temp) return ''; // pending entry somehow gone — treat as unset
    const created = await apiNs.create({ name: temp.name });
    return String(created.id);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      // Resolve any pending inline-created records to real ones, in order so
      // partial failures are obvious to the user.
      const client_id   = await resolveTempId(form.client_id,   'clients',    api.clients);
      const category_id = await resolveTempId(form.category_id, 'categories', api.categories);
      const assignee_id = await resolveTempId(form.assignee_id, 'employees',  api.employees);

      const payload = toPayload({ ...form, client_id, category_id, assignee_id }, initial);
      const saved = initial
        ? await api.projects.update(initial.id, payload)
        : await api.projects.create(payload);
      onSaved?.(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <section>
        <h3 className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted mb-2">
          Project
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project Name *" className="col-span-2">
            <Input required value={form.name} onChange={set('name')}
                   placeholder="e.g. Corporate website redesign" />
          </Field>

          <Field label="Client *" className="col-span-2">
            {lockedClientId ? (
              <div className="h-9 px-3 flex items-center rounded-md
                              bg-ink-surface dark:bg-night-raised
                              border border-ink-border dark:border-night-border
                              text-[13.5px] text-ink-muted dark:text-night-muted">
                {clients.find(c => String(c.id) === String(lockedClientId))?.name || 'This client'}
              </div>
            ) : (
              <InlineCreatableSelect
                value={form.client_id} onChange={set('client_id')}
                options={mergeOptions(clients, 'clients')}
                onCreate={makeInlineCreate('clients')}
                createLabel="Add Client" placeholder="Select client..."
              />
            )}
          </Field>

          <Field label="Category" className="col-span-2">
            <InlineCreatableSelect
              value={form.category_id} onChange={set('category_id')}
              options={mergeOptions(categories, 'categories')}
              onCreate={makeInlineCreate('categories')}
              createLabel="Add Category" placeholder="Select category..."
            />
          </Field>

          <Field label="Assignee" className="col-span-2">
            <InlineCreatableSelect
              value={form.assignee_id} onChange={set('assignee_id')}
              options={mergeOptions(employees, 'employees')}
              onCreate={makeInlineCreate('employees')}
              createLabel="Add Employee" placeholder="Select employee..."
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted mb-2">
          Delivery
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Delivery Date">
            <DatePicker value={form.delivery_date || ''} onChange={set('delivery_date')} />
          </Field>

          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={form.notes} onChange={set('notes')} />
          </Field>
        </div>
      </section>

      {error && <p className="text-[13px] text-rose-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}

function toForm(p, lockedClientId) {
  if (!p) return { ...EMPTY, client_id: lockedClientId ? String(lockedClientId) : '' };
  return {
    name:           p.name           ?? '',
    client_id:      p.client_id      ? String(p.client_id)   : (lockedClientId ? String(lockedClientId) : ''),
    category_id:    p.category_id    ? String(p.category_id) : '',
    assignee_id:    p.assignee_id    ? String(p.assignee_id) : '',
    delivery_date:  p.delivery_date  ?? '',
    notes:          p.notes          ?? ''
  };
}

// Payment fields are no longer user-editable from this form — the project's
// stored status/deposit are preserved on edit and default to neutral values
// on create. The project's effective status comes from its videos.
function toPayload(f, initial) {
  return {
    name:           f.name.trim(),
    client_id:      Number(f.client_id),
    category_id:    f.category_id ? Number(f.category_id) : null,
    assignee_id:    f.assignee_id ? Number(f.assignee_id) : null,
    payment_status: initial?.payment_status ?? 'Pending',
    deposit_paid:   0,
    delivery_date:  f.delivery_date || null,
    notes:          f.notes || null
  };
}
