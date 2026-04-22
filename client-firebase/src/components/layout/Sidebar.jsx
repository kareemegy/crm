import { NavLink } from 'react-router-dom';
import { useLayout } from './LayoutContext.jsx';

const links = [
  { to: '/',              label: 'Dashboard',          icon: DashboardIcon },
  { to: '/clients',       label: 'Clients',            icon: UsersIcon },
  { to: '/categories',    label: 'Project Categories', icon: FolderIcon },
  { to: '/service-types', label: 'Services',           icon: ServicesIcon },
  { to: '/employees',     label: 'Employees',          icon: BadgeIcon },
  { to: '/reports',       label: 'Reports',            icon: ChartIcon }
];

/**
 * On md+ this is a static column in the shell's flex layout.
 * On smaller screens it becomes a fixed drawer toggled from the TopBar.
 */
export default function Sidebar() {
  const { mobileSidebarOpen, closeMobileSidebar } = useLayout();

  return (
    <>
      {/* Backdrop on mobile when the drawer is open */}
      <div
        onClick={closeMobileSidebar}
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity
                    ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside
        className={`fixed md:static top-0 left-0 h-full z-50 w-60
                    flex flex-col shrink-0
                    border-r border-ink-border dark:border-night-border
                    bg-ink-surface dark:bg-night-surface
                    transition-transform duration-200 ease-out
                    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-ink-border dark:border-night-border">
          <img
            src="/logo.png"
            alt=""
            className="w-7 h-7 rounded-full shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="font-semibold text-[15px] truncate">Tik agency CRM</span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13.5px]
                 transition-all duration-150 active:scale-[0.98]
                 ${isActive
                   ? 'bg-white dark:bg-night-raised text-ink-text dark:text-night-text shadow-soft font-medium'
                   : 'text-ink-muted dark:text-night-muted hover:bg-white/60 dark:hover:bg-night-raised/60 hover:text-ink-text dark:hover:text-night-text'}`
              }
            >
              <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
}

// Minimal inline SVG icons — no icon library dep.
function DashboardIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
  </svg>); }
function UsersIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>); }
function FolderIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
  </svg>); }
function BadgeIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="10" r="3"/>
    <path d="M7 17c1.5-2 3-3 5-3s3.5 1 5 3"/>
  </svg>); }
function ChartIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 20V4"/><path d="M3 20h18"/><path d="M7 16v-5"/><path d="M12 16V8"/><path d="M17 16v-3"/>
  </svg>); }
function ServicesIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15.5 3.5 5 5-12 12-5 0 0-5Z"/><path d="m12 7 5 5"/>
  </svg>); }
