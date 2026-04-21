import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import CurrentDate from '../components/dashboard/CurrentDate.jsx';
import ProjectTable from '../components/projects/ProjectTable.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import TableToolbar from '../components/ui/TableToolbar.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { isToday } from '../lib/format.js';

const PAGE_SIZE = 10;

export default function Dashboard() {
  const summary    = useAsync(api.reports.summary, []);
  const projects   = useAsync(() => api.projects.list(), []);
  const categories = useAsync(api.categories.list, []);
  const employees  = useAsync(api.employees.list,  []);
  const confirm    = useConfirm();
  const navigate   = useNavigate();

  const [view, setView]           = useState('today');     // 'today' | 'all'
  const [q, setQ]                 = useState('');
  const [statusF, setStatusF]     = useState('');
  const [categoryF, setCategoryF] = useState('');
  const [assigneeF, setAssigneeF] = useState('');
  const [page, setPage]           = useState(1);

  useEffect(() => {
    const refresh = () => { summary.refetch(); projects.refetch(); };
    window.addEventListener('projects:changed', refresh);
    window.addEventListener('videos:changed',   refresh);
    return () => {
      window.removeEventListener('projects:changed', refresh);
      window.removeEventListener('videos:changed',   refresh);
    };
  }, [summary, projects]);

  // Reset pagination whenever the visible result set could change.
  useEffect(() => { setPage(1); }, [view, q, statusF, categoryF, assigneeF]);

  // "Edit" takes you to the project page where you can choose between editing
  // the project details or editing/adding individual videos.
  const onEdit   = (p) => navigate(`/projects/${p.id}`);
  const onDelete = async (p) => {
    const ok = await confirm({
      title: 'Delete project?',
      description: `"${p.name}" will be permanently removed. This action can't be undone.`,
      confirmLabel: 'Delete project',
      destructive: true
    });
    if (!ok) return;
    await api.projects.remove(p.id);
    summary.refetch(); projects.refetch();
  };

  const list = projects.data || [];

  // Step 1: scope by view (Today vs All). "Today's projects" = anything
  // delivered today OR created today, so newly-added projects (which have no
  // delivery date yet) always show up in the Today tab.
  const scoped = useMemo(
    () => view === 'today'
      ? list.filter(p => isToday(p.delivery_date) || isToday(p.created_at))
      : list,
    [list, view]
  );

  // Step 2: apply search + filters on top of the scoped set.
  const filtered = useMemo(() => scoped.filter(p => {
    if (statusF   && p.status !== statusF)                   return false;
    if (categoryF && String(p.category_id) !== categoryF)    return false;
    if (assigneeF && String(p.assignee_id) !== assigneeF)    return false;
    if (q) {
      const hay = `${p.name} ${p.client_name || ''} ${p.category_name || ''} ${p.assignee_name || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [scoped, q, statusF, categoryF, assigneeF]);

  // Step 3: paginate.
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => { setQ(''); setStatusF(''); setCategoryF(''); setAssigneeF(''); };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-[13px] text-ink-muted dark:text-night-muted">
            Revenue and active projects at a glance.
          </p>
        </div>
        <CurrentDate />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard tone="emerald" title="Income This Month"
          value={summary.data?.incomeThisMonth ?? 0}
          subtitle="Completed projects this month"
          icon={TrendUpIcon} />
        <StatCard tone="amber" title="Deposited / Waiting"
          value={summary.data?.depositedMoney ?? 0}
          subtitle="Collected from deposit projects"
          icon={WalletIcon} />
        <StatCard tone="rose" title="Expected / Pending"
          value={summary.data?.pendingMoney ?? 0}
          subtitle="Remaining balances owed"
          icon={ClockIcon} />
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">
          {view === 'today' ? "Today's Projects" : 'All Projects'}
        </h2>
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'all',   label: 'All' }
          ]}
        />
      </div>

      <TableToolbar
        search={q} onSearch={setQ}
        placeholder="Search project, client, assignee…"
        onReset={reset}
        count={`${filtered.length} of ${scoped.length} shown`}
        filters={[
          { label: 'Status', value: statusF, onChange: setStatusF,
            options: ['Completed','In Progress'].map(s => ({ value: s, label: s })) },
          { label: 'Category', value: categoryF, onChange: setCategoryF,
            options: (categories.data || []).map(c => ({ value: String(c.id), label: c.name })) },
          { label: 'Assignee', value: assigneeF, onChange: setAssigneeF,
            options: (employees.data || []).map(e => ({ value: String(e.id), label: e.name })) }
        ]}
      />

      {projects.loading && <Skeleton />}
      {projects.error   && <ErrorText text={projects.error.message} />}
      {!projects.loading && !projects.error && (
        <>
          <ProjectTable
            projects={paged}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage={view === 'today'
              ? "No projects for today. Switch to All to see everything."
              : 'No projects yet.'}
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

// Shared loading/error primitives — re-exported for other pages.
export function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 rounded-md animate-pulse
                                 bg-ink-surface dark:bg-night-raised/60" />
      ))}
    </div>
  );
}
export function ErrorText({ text }) {
  return <p className="text-[13px] text-rose-500">{text}</p>;
}

function TrendUpIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/>
  </svg>); }
function WalletIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h12l4 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M16 12h4"/>
  </svg>); }
function ClockIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  </svg>); }
