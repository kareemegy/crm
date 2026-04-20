// Currency + date helpers used across the UI.
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0
});

export const money = (v) => currency.format(Number(v || 0));

export const shortDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};

// Today's date in YYYY-MM-DD using the user's LOCAL timezone (not UTC) so it
// lines up with delivery_date values that were picked in a <input type="date">.
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Accepts either a YYYY-MM-DD date (delivery_date) or a
// "YYYY-MM-DD HH:MM:SS" datetime (created_at / updated_at) and returns true
// when the date portion equals today.
export const isToday = (value) => {
  if (!value) return false;
  return String(value).slice(0, 10) === todayISO();
};

// Tailwind classes for status pill, light + dark aware.
export const statusBadgeClass = (status) => ({
  Completed:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'In Progress': 'bg-sky-100     text-sky-700     dark:bg-sky-500/15     dark:text-sky-300',
  Deposit:       'bg-amber-100   text-amber-700   dark:bg-amber-500/15   dark:text-amber-300',
  Pending:       'bg-rose-100    text-rose-700    dark:bg-rose-500/15    dark:text-rose-300'
}[status] || 'bg-ink-surface text-ink-muted dark:bg-night-raised dark:text-night-muted');
