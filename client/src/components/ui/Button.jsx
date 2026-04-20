const variants = {
  primary:
    'bg-ink-text text-white dark:bg-white dark:text-night-bg hover:opacity-90',
  secondary:
    'bg-ink-surface text-ink-text border border-ink-border hover:bg-white ' +
    'dark:bg-night-raised dark:text-night-text dark:border-night-border dark:hover:bg-night-surface',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600',
  ghost:
    'text-ink-muted hover:text-ink-text hover:bg-ink-surface ' +
    'dark:text-night-muted dark:hover:text-night-text dark:hover:bg-night-raised'
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-md ' +
        'text-[13px] font-medium shadow-soft ' +
        'transition-all duration-150 active:scale-[0.97] ' +
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
        `${variants[variant]} ${className}`
      }
    />
  );
}
