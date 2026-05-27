// ============================================
// SpeedxSafety - Middleware
// ============================================

/**
 * Request logger — logs method, URL, status code, and response time.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`${color}${method} ${originalUrl} ${status}${reset} — ${duration}ms`);
  });

  next();
};

/**
 * 404 handler for unknown routes.
 */
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    status: 404,
  });
};

/**
 * Global error handler — catches unhandled errors and returns structured JSON.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', err.message || err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    status,
  });
};

module.exports = {
  requestLogger,
  notFoundHandler,
  errorHandler,
};
