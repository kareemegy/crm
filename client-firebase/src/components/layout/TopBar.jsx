import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { useLayout } from './LayoutContext.jsx';

export default function TopBar() {
  const { theme, toggle } = useTheme();
  const { toggleMobileSidebar } = useLayout();

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-5 gap-2
                        border-b border-ink-border dark:border-night-border
                        bg-ink-bg/80 dark:bg-night-bg/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open navigation"
          className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md
                     text-ink-muted dark:text-night-muted
                     hover:bg-ink-surface dark:hover:bg-night-raised
                     transition-all duration-150 active:scale-[0.92]"
        >
          <MenuIcon className="w-[18px] h-[18px]" />
        </button>
        <div className="hidden sm:block text-[13px] text-ink-muted dark:text-night-muted">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="h-9 w-9 inline-flex items-center justify-center rounded-md
                     text-ink-muted dark:text-night-muted
                     hover:bg-ink-surface dark:hover:bg-night-raised
                     transition-all duration-150 active:scale-[0.92]"
        >
          {theme === 'dark' ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
        </button>

        <Link
          to="/projects/new"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-md
                     bg-ink-text text-white dark:bg-white dark:text-night-bg
                     text-[13px] font-medium shadow-soft
                     hover:opacity-90 active:scale-[0.97] transition-all duration-150"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">Add Project</span>
          <span className="xs:hidden sm:hidden">Add</span>
        </Link>
      </div>
    </header>
  );
}

function MenuIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>); }

function SunIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>); }
function MoonIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
  </svg>); }
function PlusIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14M5 12h14"/>
  </svg>); }
