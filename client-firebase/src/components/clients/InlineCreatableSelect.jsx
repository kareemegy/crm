import { useState } from 'react';
import { Select, Input } from '../ui/Field.jsx';
import Button from '../ui/Button.jsx';

/**
 * Dropdown with a small inline "+ Add" affordance. When the user clicks it, a
 * tiny inline form opens beneath the select; on submit we call `onCreate` which
 * performs the API call, then we refresh the parent list and auto-select the
 * new record.
 */
export default function InlineCreatableSelect({
  value, onChange, options,
  onCreate, onCreated,
  createLabel = 'Add',
  placeholder = 'Select...',
  id
}) {
  const [adding, setAdding]   = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newName.trim()) return;
    setSaving(true); setError(null);
    try {
      const created = await onCreate({ name: newName.trim() });
      await onCreated?.();
      onChange(String(created.id));
      setNewName('');
      setAdding(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <Select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </Select>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setAdding(v => !v)}
        >
          {adding ? 'Cancel' : `+ ${createLabel}`}
        </Button>
      </div>

      {adding && (
        <div className="mt-2 p-3 rounded-md
                        bg-ink-surface dark:bg-night-raised
                        border border-ink-border dark:border-night-border
                        animate-slide-up">
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder={`New ${createLabel.replace(/^Add\s+/i, '').toLowerCase()} name`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(e)}
            />
            <Button type="button" onClick={submit} disabled={saving || !newName.trim()}>
              {saving ? 'Saving…' : 'Create'}
            </Button>
          </div>
          {error && <p className="text-[12px] text-rose-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
