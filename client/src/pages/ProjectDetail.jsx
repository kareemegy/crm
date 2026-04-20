import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import Button from '../components/ui/Button.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { useSmartBack } from '../hooks/useSmartBack.js';
import VideoSection from '../components/projects/VideoSection.jsx';
import { money, shortDate, statusBadgeClass } from '../lib/format.js';
import { Skeleton, ErrorText } from './Dashboard.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  const confirm   = useConfirm();
  const goBack    = useSmartBack('/');

  const project = useAsync(() => api.projects.get(projectId), [projectId]);

  // Video CRUD changes price + NOV, so refresh the project when they change.
  useEffect(() => {
    const refresh = () => project.refetch();
    window.addEventListener('videos:changed', refresh);
    return () => window.removeEventListener('videos:changed', refresh);
  }, [project]);

  const remove = async () => {
    const ok = await confirm({
      title: 'Delete project?',
      description: `"${project.data?.name}" will be permanently removed. This action can't be undone.`,
      confirmLabel: 'Delete project',
      destructive: true
    });
    if (!ok) return;
    await api.projects.remove(projectId);
    navigate('/');
  };


  if (project.loading)             return <Skeleton />;
  if (project.error || !project.data) return <ErrorText text={project.error?.message || 'Project not found.'} />;

  const p = project.data;
  // Money aggregates served by the API.
  const received  = Number(p.received  ?? 0);  // already collected
  const remaining = Number(p.remaining ?? 0);  // still expected
  const budget    = Number(p.price     ?? 0);  // overall project price

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1 text-[12px]
                   text-ink-muted dark:text-night-muted
                   hover:text-ink-text dark:hover:text-night-text mb-4
                   transition-colors active:scale-[0.98]"
      >
        <BackIcon className="w-3.5 h-3.5" /> Back
      </button>

      <div className="rounded-xl p-4 sm:p-6 mb-6
                      bg-ink-bg dark:bg-night-surface
                      border border-ink-border dark:border-night-border
                      shadow-soft">
        {/* Title row: status/name on the left, Edit/Delete on the right. */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${statusBadgeClass(p.status)}`}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {p.status}
              </span>
              {p.category_name && (
                <span className="text-[11.5px] text-ink-muted dark:text-night-muted">
                  · {p.category_name}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight break-words">{p.name}</h1>
            {p.client_id && (
              <div className="mt-1 text-[13px] text-ink-muted dark:text-night-muted">
                for <Link to={`/clients/${p.client_id}`} className="underline decoration-accent-500 decoration-2 underline-offset-2 hover:text-ink-text dark:hover:text-night-text break-words">{p.client_name}</Link>
              </div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}/edit`)}>Edit</Button>
            <Button variant="danger"    onClick={remove}>Delete</Button>
          </div>
        </div>

        {/* Money row: three boxed cards, stacking at the smallest sizes. */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4
                        mt-5 pt-5 border-t border-ink-border dark:border-night-border">
          <MoneyBox label="Income Received" value={money(received)}  tone="emerald" />
          <MoneyBox label="Expected"        value={money(remaining)} tone="amber"   />
          <MoneyBox label="Total Budget"    value={money(budget)}    tone="neutral" />
        </div>

        {/* Secondary facts. */}
        <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4
                       mt-5 pt-5 border-t border-ink-border dark:border-night-border">
          <Stat label="Services"     value={p.video_count} />
          <Stat label="Delivery"     value={shortDate(p.delivery_date)} />
          <Stat label="Assignee"     value={p.assignee_name || '—'} />
          <Stat label="Created"      value={shortDate(p.created_at)} />
          <Stat label="Last Updated" value={shortDate(p.updated_at)} />
        </dl>

        {p.notes && (
          <div className="mt-5 pt-5 border-t border-ink-border dark:border-night-border">
            <div className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted mb-2">
              Notes
            </div>
            <p className="text-[14px] whitespace-pre-wrap leading-relaxed break-words">{p.notes}</p>
          </div>
        )}
      </div>

      <VideoSection projectId={projectId} />
    </div>
  );
}

// Compact money box used in the project hero. Accent color carries meaning:
// emerald = collected, amber = still expected, neutral = overall budget.
function MoneyBox({ label, value, tone }) {
  const toneAccent = {
    emerald: 'border-l-emerald-500 dark:border-l-emerald-400',
    amber:   'border-l-amber-500   dark:border-l-amber-400',
    neutral: 'border-l-ink-border  dark:border-l-night-border'
  }[tone];
  const valueClass = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent',
    amber:   'text-amber-600 dark:text-amber-400',
    neutral: 'text-ink-text dark:text-night-text'
  }[tone];
  return (
    <div className={`min-w-0 rounded-lg p-3 sm:p-4 border-l-[3px]
                     bg-ink-surface/60 dark:bg-night-raised/40
                     border-y border-r border-ink-border/70 dark:border-night-border/70
                     ${toneAccent}`}>
      <div className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted">
        {label}
      </div>
      <div className={`mt-1 text-xl sm:text-2xl lg:text-[28px] font-bold tabular-nums leading-none truncate ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted">
        {label}
      </dt>
      <dd className={`mt-1 text-[14px] font-medium tabular-nums ${
        tone === 'rose'    ? 'text-rose-500' :
        tone === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
        tone === 'amber'   ? 'text-amber-600  dark:text-amber-400'   : ''
      }`}>
        {value}
      </dd>
    </div>
  );
}

function BackIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 18-6-6 6-6"/>
  </svg>); }
