// Single EventSource subscription that fans CRUD events out to:
//   1. `window` events (reusing the existing `clients:changed` / `projects:changed`
//      pattern so existing pages refetch without changes)
//   2. `toast:show` window events consumed by ToastHost
//
// The API base respects VITE_API_BASE_URL exactly like api.js — so desktop,
// web, and the Capacitor APK all subscribe to the same deployed server.
const BASE = (import.meta.env.VITE_API_BASE_URL || '') + '/api';

const ENTITY_MAP = {
  'clients':       { label: 'Client',       windowEvent: 'clients:changed'       },
  'projects':      { label: 'Project',      windowEvent: 'projects:changed'      },
  'videos':        { label: 'Video',        windowEvent: 'projects:changed'      },
  'categories':    { label: 'Category',     windowEvent: 'categories:changed'    },
  'employees':     { label: 'Employee',     windowEvent: 'employees:changed'     },
  'service-types': { label: 'Service type', windowEvent: 'service-types:changed' }
};

const ACTIONS = ['created', 'updated', 'deleted'];

let source = null;

export function startRealtime() {
  if (source) return;
  source = new EventSource(`${BASE}/events`);

  source.addEventListener('error', () => {
    // EventSource auto-reconnects; just log for visibility.
    if (typeof console !== 'undefined') console.warn('[realtime] SSE disconnected, reconnecting…');
  });

  for (const entity of Object.keys(ENTITY_MAP)) {
    for (const action of ACTIONS) {
      const type = `${entity}.${action}`;
      source.addEventListener(type, (e) => {
        let payload = {};
        try { payload = JSON.parse(e.data); } catch { /* noop */ }

        const { label, windowEvent } = ENTITY_MAP[entity];
        window.dispatchEvent(new CustomEvent(windowEvent));

        const nameSuffix = payload.name ? `: ${payload.name}` : '';
        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: {
            message: `${label} ${action}${nameSuffix}`,
            kind: action === 'deleted' ? 'warn' : 'info'
          }
        }));
      });
    }
  }
}

export function stopRealtime() {
  if (source) {
    source.close();
    source = null;
  }
}
