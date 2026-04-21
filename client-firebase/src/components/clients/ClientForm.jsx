import { useEffect, useState } from 'react';
import { api } from '../../api/api.js';
import { Field, Input, Textarea } from '../ui/Field.jsx';
import Button from '../ui/Button.jsx';

const EMPTY = { name: '', email: '', phone: '', notes: '' };

/**
 * Client form. Contact data only — projects are managed separately.
 */
export default function ClientForm({ initial, onSaved, onCancel }) {
  const [form, setForm]     = useState(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => { setForm(toForm(initial)); }, [initial]);

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = toPayload(form);
      const saved = initial
        ? await api.clients.update(initial.id, payload)
        : await api.clients.create(payload);
      onSaved?.(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Client Name *" className="col-span-2">
          <Input required value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Notes" className="col-span-2">
          <Textarea rows={3} value={form.notes} onChange={set('notes')} />
        </Field>
      </div>

      {error && <p className="text-[13px] text-rose-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}

function toForm(c) {
  if (!c) return { ...EMPTY };
  return {
    name:  c.name  ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    notes: c.notes ?? ''
  };
}

function toPayload(f) {
  return {
    name:  f.name.trim(),
    email: f.email || null,
    phone: f.phone || null,
    notes: f.notes || null
  };
}
