import { useEffect, useState } from 'react';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import DataTable from '../components/ui/DataTable.jsx';
import { Field, Select, Input } from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import ProjectTable from '../components/projects/ProjectTable.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { money } from '../lib/format.js';

export default function Reports() {
  const categories = useAsync(api.categories.list, []);
  const employees  = useAsync(api.employees.list,  []);
  const workload   = useAsync(api.reports.workload,   []);
  const byStatus   = useAsync(api.reports.byStatus,   []);
  const byCategory = useAsync(api.reports.byCategory, []);
  const monthly    = useAsync(api.reports.monthly,    []);

  const [filters, setFilters] = useState({
    status: '', categoryId: '', assigneeId: '', from: '', to: ''
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { setProjects(await api.projects.list(filters)); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); /* eslint-disable-line */ }, [
    filters.status, filters.categoryId, filters.assigneeId, filters.from, filters.to
  ]);

  const set   = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));
  const reset = ()       => setFilters({ status: '', categoryId: '', assigneeId: '', from: '', to: '' });

  const anyFilterActive = Object.values(filters).some(v => v);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Filter projects and dive into company performance."
      />

      <section className={`rounded-xl p-4 shadow-soft transition-all
                          bg-ink-bg dark:bg-night-surface
                          border ${anyFilterActive
                            ? 'border-accent-500/60 ring-2 ring-accent-500/10'
                            : 'border-ink-border dark:border-night-border'}`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label="Status">
            <Select value={filters.status} onChange={set('status')} active={!!filters.status}>
              <option value="">All</option>
              <option value="Completed">Completed</option>
              <option value="Deposit">Deposit</option>
              <option value="Pending">Pending</option>
            </Select>
          </Field>
          <Field label="Category">
            <Select value={filters.categoryId} onChange={set('categoryId')} active={!!filters.categoryId}>
              <option value="">All</option>
              {(categories.data || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Assignee">
            <Select value={filters.assigneeId} onChange={set('assigneeId')} active={!!filters.assigneeId}>
              <option value="">All</option>
              {(employees.data || []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <Field label="Delivery from">
            <Input type="date" value={filters.from} onChange={set('from')} active={!!filters.from} />
          </Field>
          <Field label="Delivery to">
            <Input type="date" value={filters.to} onChange={set('to')} active={!!filters.to} />
          </Field>
        </div>
        <div className="flex items-center justify-between mt-3">
          {anyFilterActive ? (
            <div className="text-[12px] text-accent-700 dark:text-accent-300 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-dot" />
              Filters active — showing narrowed results
            </div>
          ) : <span />}
          <Button variant="ghost" onClick={reset}>Reset filters</Button>
        </div>
      </section>

      <Section title="Matching Projects" hint={loading ? 'loading…' : `${projects.length} results`}>
        <ProjectTable projects={projects} />
      </Section>

      <Section title="Employee Workload">
        <DataTable
          rows={workload.data || []}
          emptyMessage="No employees."
          columns={[
            { key: 'name',            header: 'Employee' },
            { key: 'role',            header: 'Role', render: r => r.role || '—' },
            { key: 'total_projects',  header: 'Total',  render: r => <span className="tabular-nums">{r.total_projects}</span> },
            { key: 'active_projects', header: 'Active', render: r => <span className="tabular-nums">{r.active_projects}</span> },
            { key: 'total_value',     header: 'Total Value', render: r => <span className="tabular-nums">{money(r.total_value)}</span> }
          ]}
        />
      </Section>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Breakdown title="By Status"   rows={byStatus.data   || []} labelKey="status"   />
        <Breakdown title="By Category" rows={byCategory.data || []} labelKey="category" />
      </div>

      <Section title="Monthly Completed Revenue">
        <DataTable
          rows={monthly.data || []}
          emptyMessage="No completed revenue yet."
          columns={[
            { key: 'month',   header: 'Month',   render: r => <span className="tabular-nums">{r.month}</span> },
            { key: 'revenue', header: 'Revenue', render: r => <span className="tabular-nums">{money(r.revenue)}</span> }
          ]}
        />
      </Section>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {hint && <span className="text-[12px] text-ink-muted dark:text-night-muted">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Breakdown({ title, rows, labelKey }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold mb-3">{title}</h3>
      <DataTable
        rows={rows}
        emptyMessage="No data."
        columns={[
          { key: labelKey,      header: title.replace(/^By /, '') },
          { key: 'count',       header: 'Projects',    render: r => <span className="tabular-nums">{r.count}</span> },
          { key: 'total_value', header: 'Total Value', render: r => <span className="tabular-nums">{money(r.total_value)}</span> }
        ]}
      />
    </div>
  );
}
