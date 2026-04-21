import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import ProjectTable from '../components/projects/ProjectTable.jsx';
import ClientFormModal from '../components/clients/ClientFormModal.jsx';
import Button from '../components/ui/Button.jsx';
import TableToolbar from '../components/ui/TableToolbar.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { useSmartBack } from '../hooks/useSmartBack.js';
import { money } from '../lib/format.js';
import { Skeleton, ErrorText } from './Dashboard.jsx';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clientId = Number(id);
  const confirm  = useConfirm();
  const goBack   = useSmartBack('/clients');

  const client   = useAsync(() => api.clients.get(clientId), [clientId]);
  const projects = useAsync(() => api.projects.list({ clientId }), [clientId]);

  const [editingClient, setEditingClient] = useState(false);
  const [q, setQ]                         = useState('');
  const [statusF, setStatusF]             = useState('');

  useEffect(() => {
    const refreshAll = () => { client.refetch(); projects.refetch(); };
    window.addEventListener('clients:changed',  refreshAll);
    window.addEventListener('projects:changed', refreshAll);
    window.addEventListener('videos:changed',   refreshAll);
    return () => {
      window.removeEventListener('clients:changed',  refreshAll);
      window.removeEventListener('projects:changed', refreshAll);
      window.removeEventListener('videos:changed',   refreshAll);
    };
  }, [client, projects]);

  const projectList = projects.data || [];
  const filteredProjects = useMemo(() => projectList.filter(p => {
    if (statusF && p.status !== statusF) return false;
    if (q) {
      const hay = `${p.name} ${p.category_name || ''} ${p.assignee_name || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [projectList, q, statusF]);

  const deleteClient = async () => {
    const ok = await confirm({
      title: 'Delete client?',
      description: `"${client.data?.name}" and all ${client.data?.project_count || 0} associated project(s) will be permanently removed. This action can't be undone.`,
      confirmLabel: 'Delete client',
      destructive: true
    });
    if (!ok) return;
    await api.clients.remove(clientId);
    navigate('/clients');
  };

  const deleteProject = async (p) => {
    const ok = await confirm({
      title: 'Delete project?',
      description: `"${p.name}" will be permanently removed. This action can't be undone.`,
      confirmLabel: 'Delete project',
      destructive: true
    });
    if (!ok) return;
    await api.projects.remove(p.id);
    projects.refetch(); client.refetch();
  };

  if (client.loading)              return <Skeleton />;
  if (client.error || !client.data) return <ErrorText text={client.error?.message || 'Client not found.'} />;

  const c = client.data;

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

      {/* Hero card */}
      <div className="rounded-xl p-4 sm:p-5 mb-6
                      bg-ink-bg dark:bg-night-surface
                      border border-ink-border dark:border-night-border
                      shadow-soft flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full
                          bg-gradient-to-br from-accent-500 to-accent-700 text-white
                          flex items-center justify-center text-base sm:text-lg font-semibold shadow-soft">
            {initialsOf(c.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight break-words">{c.name}</h1>
            <div className="mt-1 text-[13px] text-ink-muted dark:text-night-muted flex flex-wrap gap-x-3">
              {c.email && <span className="break-all">{c.email}</span>}
              {c.phone && <span>· {c.phone}</span>}
            </div>
            {c.notes && (
              <p className="mt-3 text-[13px] text-ink-muted dark:text-night-muted whitespace-pre-wrap break-words">
                {c.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="secondary" onClick={() => setEditingClient(true)}>Edit</Button>
          <Button variant="danger"    onClick={deleteClient}>Delete</Button>
        </div>
      </div>

      {/* Aggregates. Pending + Total Value are only useful while the client
          still owes money; collapse to 2 tiles once everything is paid. */}
      {(() => {
        const hasOutstanding = Number(c.pending_value) > 0;
        return (
          <div className={`grid gap-3 sm:gap-4 mb-6 ${
            hasOutstanding ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
          }`}>
            <StatTile label="Projects"        value={c.project_count} />
            <StatTile label="Income Received" value={money(c.received_value)} tone="emerald" />
            {hasOutstanding && (
              <>
                <StatTile label="Pending"     value={money(c.pending_value)}  tone="rose" />
                <StatTile label="Total Value" value={money(c.total_value)} />
              </>
            )}
          </div>
        );
      })()}

      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h2 className="text-[15px] font-semibold">Projects</h2>
        <Link
          to={`/projects/new?clientId=${clientId}`}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md
                     bg-ink-text text-white dark:bg-white dark:text-night-bg
                     text-[13px] font-medium shadow-soft
                     hover:opacity-90 active:scale-[0.97] transition-all duration-150"
        >
          + New Project
        </Link>
      </div>

      <TableToolbar
        search={q} onSearch={setQ}
        placeholder="Search project, category, assignee…"
        onReset={() => { setQ(''); setStatusF(''); }}
        count={`${filteredProjects.length} of ${projectList.length} shown`}
        filters={[
          { label: 'Status', value: statusF, onChange: setStatusF,
            options: ['Completed','In Progress'].map(s => ({ value: s, label: s })) }
        ]}
      />

      {projects.loading && <Skeleton />}
      {!projects.loading && (
        <ProjectTable
          projects={filteredProjects}
          showClient={false}
          onEdit={(p) => navigate(`/projects/${p.id}`)}
          onDelete={deleteProject}
          emptyMessage="This client has no projects yet."
        />
      )}

      <ClientFormModal
        open={editingClient}
        initial={c}
        onClose={() => setEditingClient(false)}
        onSaved={() => { setEditingClient(false); client.refetch(); }}
      />
    </div>
  );
}

function StatTile({ label, value, tone }) {
  const valueClass = {
    rose:    'text-rose-500',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent'
  }[tone] || '';
  return (
    <div className="rounded-lg p-4 bg-ink-bg dark:bg-night-surface
                    border border-ink-border dark:border-night-border shadow-soft">
      <div className="text-[11px] uppercase tracking-wide font-medium text-ink-muted dark:text-night-muted">
        {label}
      </div>
      <div className={`mt-1 text-lg sm:text-xl font-semibold tabular-nums truncate ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?';
}

function BackIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 18-6-6 6-6"/>
  </svg>); }
