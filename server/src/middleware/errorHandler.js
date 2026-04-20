// Typed error for controllers/services to throw with an HTTP status.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wrap async handlers so thrown errors reach the error middleware without try/catch everywhere.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Central error response. Keeps controller code free of response shaping.
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}
