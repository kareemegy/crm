// Firestore equivalent of the SSE realtime layer used by client/. Listens for
// every CRUD collection and:
//   1. fires the existing `clients:changed` / `projects:changed` / … window
//      events so pages refetch without any code changes,
//   2. fires `toast:show` for each real delta (except the initial snapshot,
//      which just carries existing docs).
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config.js';

const SUBSCRIPTIONS = [
  { col: 'clients',      label: 'Client',       event: 'clients:changed'       },
  { col: 'projects',     label: 'Project',      event: 'projects:changed'      },
  { col: 'videos',       label: 'Video',        event: 'projects:changed'      },
  { col: 'categories',   label: 'Category',     event: 'categories:changed'    },
  { col: 'employees',    label: 'Employee',     event: 'employees:changed'     },
  { col: 'serviceTypes', label: 'Service type', event: 'service-types:changed' }
];

const unsubscribers = [];

export function startRealtime() {
  if (unsubscribers.length) return;

  for (const { col, label, event } of SUBSCRIPTIONS) {
    let isInitial = true;
    const unsub = onSnapshot(
      collection(db, col),
      (snap) => {
        if (isInitial) {
          isInitial = false;
          window.dispatchEvent(new CustomEvent(event));
          return;
        }
        for (const change of snap.docChanges()) {
          const data = change.doc.data();
          const action = change.type === 'added'    ? 'created'
                       : change.type === 'modified' ? 'updated'
                       : 'deleted';
          const nameSuffix = data?.name ? `: ${data.name}` : '';
          window.dispatchEvent(new CustomEvent('toast:show', {
            detail: {
              message: `${label} ${action}${nameSuffix}`,
              kind: action === 'deleted' ? 'warn' : 'info'
            }
          }));
        }
        window.dispatchEvent(new CustomEvent(event));
      },
      (err) => {
        console.warn(`[realtime] ${col} listener error`, err);
      }
    );
    unsubscribers.push(unsub);
  }
}

export function stopRealtime() {
  for (const unsub of unsubscribers) unsub();
  unsubscribers.length = 0;
}
