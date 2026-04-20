import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { useSmartBack } from '../hooks/useSmartBack.js';
import ProjectForm from '../components/projects/ProjectForm.jsx';
import { notifyProjectsChanged, notifyClientsChanged } from '../components/layout/LayoutContext.jsx';
import { Skeleton, ErrorText } from './Dashboard.jsx';

/**
 * Dedicated page for create + edit. Navigable by URL so accidental clicks
 * outside don't dismiss in-progress work.
 *   /projects/new              → create
 *   /projects/new?clientId=N   → create pre-filled for a client
 *   /projects/:id/edit         → edit existing
 */
export default function ProjectFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const isEdit         = !!id;
  const projectId      = isEdit ? Number(id) : null;
  const lockedClientId = params.get('clientId');

  const existing = useAsync(
    () => (isEdit ? api.projects.get(projectId) : Promise.resolve(null)),
    [projectId, isEdit]
  );

  // Context-aware fallback for the "Back"/Cancel actions when there's no
  // history to pop (deep link, refresh).
  const fallbackPath =
    isEdit            ? `/projects/${projectId}` :
    lockedClientId    ? `/clients/${lockedClientId}` :
                        '/';

  const goBack = useSmartBack(fallbackPath);

  const onSaved = (saved) => {
    notifyProjectsChanged();
    notifyClientsChanged();
    navigate(`/projects/${saved.id}`);
  };

  if (isEdit && existing.loading) return <Skeleton />;
  if (isEdit && existing.error)   return <ErrorText text={existing.error.message} />;

  return (
    <div className="animate-fade-in max-w-3xl">
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

      <div className="mb-5 animate-slide-up">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? 'Edit Project' : 'New Project'}
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted dark:text-night-muted">
          {isEdit
            ? 'Update project details, payment, or delivery info.'
            : 'Fill in the details below. Your work stays on this page until you save or cancel.'}
        </p>
      </div>

      <div className="rounded-xl p-6
                      bg-ink-bg dark:bg-night-surface
                      border border-ink-border dark:border-night-border
                      shadow-soft">
        <ProjectForm
          initial={isEdit ? existing.data : null}
          lockedClientId={isEdit ? null : lockedClientId}
          onSaved={onSaved}
          onCancel={goBack}
        />
      </div>
    </div>
  );
}

function BackIcon(props) { return (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 18-6-6 6-6"/>
  </svg>); }
