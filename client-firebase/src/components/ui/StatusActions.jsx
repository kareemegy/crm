import { useState } from 'react';
import Button from './Button.jsx';
import { Input } from './Field.jsx';

/**
 * Per-video contextual status buttons. Only surfaces transitions that make
 * business sense:
 *
 *   Pending   → [Deposit received]  [Mark as done]
 *   Deposit   → [Add more deposit]  [Mark as done]
 *   Completed → (nothing — final)
 *
 * "Deposit received" (from Pending) is a straightforward transition — the
 * parent supplies the amount via its own edit flow if needed.
 *
 * "Add more deposit" (from Deposit) pops a tiny inline input so the user can
 * type the additional amount. The parent's `onAddDeposit(amount)` handler
 * increments `deposit_paid` on the server. If the running total reaches the
 * price, the row is marked Completed automatically.
 *
 * Props:
 *   value          : 'Pending' | 'Deposit' | 'Completed'
 *   remaining      : price - current deposit (used to cap and label)
 *   onChange       : async (newStatus) => void        // simple transition
 *   onAddDeposit   : async (amount) => void           // increments deposit
 */
export default function StatusActions({ value, remaining = 0, onChange, onAddDeposit }) {
  const [saving, setSaving] = useState(false);
  const [addingDeposit, setAddingDeposit] = useState(false);
  const [amount, setAmount] = useState('');
  const [err, setErr]       = useState(null);

  const run = (next) => async () => {
    if (saving) return;
    setSaving(true);
    try { await onChange(next); }
    finally { setSaving(false); }
  };

  const submitDeposit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) { setErr('Enter a positive amount'); return; }
    if (n > remaining + 0.0001)        { setErr(`Cannot exceed remaining (${remaining})`); return; }
    setSaving(true); setErr(null);
    try {
      await onAddDeposit(n);
      setAmount('');
      setAddingDeposit(false);
    } catch (ex) { setErr(ex.message); }
    finally     { setSaving(false); }
  };

  // Completed is a terminal state — nothing to do.
  if (value === 'Completed') return null;

  // Pending: offer both onward transitions.
  if (value === 'Pending') {
    return (
      <div className="flex gap-1.5 flex-wrap">
        <Button variant="secondary" disabled={saving} onClick={run('Deposit')}>
          <WalletIcon className="w-3.5 h-3.5 mr-1" />
          Deposit received
        </Button>
        <Button variant="primary" disabled={saving} onClick={run('Completed')}>
          <CheckIcon className="w-3.5 h-3.5 mr-1" />
          Mark as done
        </Button>
      </div>
    );
  }

  // Deposit: collect more OR finish.
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-1.5 flex-wrap">
        <Button
          variant="secondary"
          disabled={saving || remaining <= 0}
          onClick={() => { setErr(null); setAddingDeposit(v => !v); }}
        >
          <PlusIcon className="w-3.5 h-3.5 mr-1" />
          {addingDeposit ? 'Cancel' : 'Add more deposit'}
        </Button>
        <Button
          variant="primary"
          // Disable while the user is entering a deposit amount so they don't
          // accidentally close out the video instead of recording the payment.
          disabled={saving || addingDeposit}
          title={addingDeposit ? 'Finish adding the deposit first' : undefined}
          onClick={run('Completed')}
        >
          <CheckIcon className="w-3.5 h-3.5 mr-1" />
          Mark as done
        </Button>
      </div>

      {addingDeposit && (
        <form
          onSubmit={submitDeposit}
          className="flex items-center gap-1.5 animate-slide-up"
        >
          <Input
            type="number" min="0" step="0.01" autoFocus
            placeholder={`+ amount (max ${remaining})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-44"
          />
          <Button type="submit" disabled={saving || !amount}>
            {saving ? 'Adding…' : 'Add'}
          </Button>
        </form>
      )}
      {err && <p className="text-[11px] text-rose-500">{err}</p>}
    </div>
  );
}

function CheckIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>); }
function WalletIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h12l4 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M16 12h4"/>
  </svg>); }
function PlusIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14M5 12h14"/>
  </svg>); }
