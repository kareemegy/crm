// Human-friendly translations for common Firebase errors. Keeps raw strings
// like "n.indexOf is not a function" or "FirebaseError: [code=...]" out of
// the UI — callers re-throw these and show `.message` directly.

const FIRESTORE_MESSAGES = {
  'permission-denied':   "You don't have permission to do that.",
  'unavailable':         "Can't reach the database. Check your internet connection.",
  'not-found':           'Item not found.',
  'already-exists':      'That item already exists.',
  'invalid-argument':    'Some data was invalid — please review the form and try again.',
  'failed-precondition': "That action can't be completed right now.",
  'deadline-exceeded':   'The request timed out — please try again.',
  'resource-exhausted':  "You've hit a usage quota. Try again later.",
  'unauthenticated':     'Please sign in to continue.',
  'cancelled':           'Action was cancelled.',
  'aborted':             'Action was aborted — please try again.',
  'internal':            'Something went wrong on the server. Please try again.',
  'data-loss':           'Some data could not be saved. Please try again.',
  'out-of-range':        'A value was outside the allowed range.',
  'unknown':             'Something unexpected happened. Please try again.'
};

function bareCode(err) {
  const raw = err?.code;
  if (typeof raw !== 'string') return null;
  // Firebase codes can look like 'firestore/permission-denied' or
  // 'auth/user-not-found'. Strip the prefix.
  const slash = raw.indexOf('/');
  return slash >= 0 ? raw.slice(slash + 1) : raw;
}

export function friendlyError(err) {
  if (!err) return new Error('Unknown error.');

  const code = bareCode(err);
  let message = (code && FIRESTORE_MESSAGES[code]) || null;

  // Heuristic fallbacks for bugs that bubble up as raw JS errors (typed args,
  // network issues) — so the user never sees "n.indexOf is not a function".
  if (!message) {
    const text = String(err.message || '').toLowerCase();
    if (text.includes('network') || text.includes('failed to fetch')) {
      message = 'Network error — check your internet connection.';
    } else if (text.includes('indexof') || text.includes('is not a function') || text.includes('undefined')) {
      message = 'Something went wrong with that request. Please refresh and try again.';
    } else if (err.message && err.message.length < 160 && !text.includes('firebaseerror')) {
      message = err.message;
    } else {
      message = 'Something went wrong. Please try again.';
    }
  }

  const wrapped = new Error(message);
  wrapped.code     = code || 'unknown';
  wrapped.original = err;
  return wrapped;
}

// Convenience: wrap an async function so any throw is translated before
// bubbling out. Used by the API layer.
export function withFriendlyErrors(fn) {
  return async (...args) => {
    try { return await fn(...args); }
    catch (err) {
      console.error('[api]', err);
      throw friendlyError(err);
    }
  };
}
