import { EventEmitter } from 'events';

// Single in-process broadcaster for SSE fan-out. Every SSE subscriber
// attaches a 'broadcast' listener; controllers emit after successful mutations.
export const bus = new EventEmitter();
bus.setMaxListeners(0);

export function broadcast(type, payload = {}) {
  bus.emit('broadcast', { type, payload, at: Date.now() });
}
