// Centralized error handler. Controllers throw Error objects with an
// optional `.status`; anything unrecognized becomes a 500 without
// leaking internals to the client.
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status >= 500 ? 'Something went wrong on our end.' : err.message,
  });
}
