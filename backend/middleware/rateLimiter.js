// ============================================
// SpeedxSafety - Rate Limiter Middleware
// ============================================
// In-memory sliding-window rate limiter.
// No external dependencies — suitable for single-instance deployments.
// For multi-instance deployments, swap to Redis-backed store.

/**
 * Create a rate-limiting middleware.
 *
 * @param {Object} options
 * @param {number} options.windowMs   - Time window in milliseconds (default: 60 000 = 1 min)
 * @param {number} options.maxRequests - Max requests per window per IP (default: 100)
 * @param {string} [options.message]   - Custom error message
 * @returns {Function} Express middleware
 */
const createRateLimiter = ({
  windowMs = 60 * 1000,
  maxRequests = 100,
  message = 'Too many requests, please try again later',
} = {}) => {
  // Map<ip, { count, resetTime }>
  const clients = new Map();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, windowMs * 2);

  // Allow the timer to not keep the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let record = clients.get(ip);

    if (!record || now > record.resetTime) {
      // First request or window expired — start a new window
      record = { count: 1, resetTime: now + windowMs };
      clients.set(ip, record);
      setRateLimitHeaders(res, maxRequests, maxRequests - 1, record.resetTime);
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      setRateLimitHeaders(res, maxRequests, 0, record.resetTime);
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfterMs: record.resetTime - now,
      });
    }

    setRateLimitHeaders(res, maxRequests, maxRequests - record.count, record.resetTime);
    next();
  };
};

/**
 * Set standard rate-limit response headers.
 */
const setRateLimitHeaders = (res, limit, remaining, resetTime) => {
  res.set('X-RateLimit-Limit', String(limit));
  res.set('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  res.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
};

// ── Pre-configured limiters for different route groups ──

/** General API limiter: 100 req / min */
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'API rate limit exceeded. Please slow down.',
});

/** Auth limiter: 10 req / min — prevents brute-force login */
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please wait a minute.',
});

/** Telemetry limiter: 300 req / min — location pings are frequent */
const telemetryLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 300,
  message: 'Telemetry rate limit exceeded.',
});

/** Alert creation limiter: 30 req / min */
const alertLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Alert creation rate limit exceeded.',
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  telemetryLimiter,
  alertLimiter,
};
