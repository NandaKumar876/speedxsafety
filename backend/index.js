// ============================================
// SpeedxSafety - Backend Server
// ============================================

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Middleware
const { requestLogger, notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, telemetryLimiter, alertLimiter } = require('./middleware/rateLimiter');
const { supabaseSessionMiddleware } = require('./middleware/supabaseSession');

// Route modules
const authRoutes = require('./routes/auth');
const teensRoutes = require('./routes/teens');
const tripsRoutes = require('./routes/trips');
const alertsRoutes = require('./routes/alerts');
const geofencesRoutes = require('./routes/geofences');
const badgesRoutes = require('./routes/badges');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ────────────────────────
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : '*';
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: corsOrigins !== '*',
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));   // Guard against oversized payloads
app.use(requestLogger);
app.use(supabaseSessionMiddleware);

// ── Health Check ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'SpeedxSafety API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: {
      auth: '/api/auth',
      teens: '/api/teens',
      trips: '/api/trips',
      alerts: '/api/alerts',
      geofences: '/api/geofences',
      badges: '/api/badges',
      reports: '/api/reports',
    },
  });
});

// ── API Routes (with per-group rate limiting) ─
app.use('/api/auth', authLimiter, authRoutes);             // strict: 10 req/min
app.use('/api/teens', telemetryLimiter, teensRoutes);      // generous: 300 req/min (location pings)
app.use('/api/trips', apiLimiter, tripsRoutes);             // standard: 100 req/min
app.use('/api/alerts', alertLimiter, alertsRoutes);         // moderate: 30 req/min
app.use('/api/geofences', apiLimiter, geofencesRoutes);     // standard: 100 req/min
app.use('/api/badges', apiLimiter, badgesRoutes);           // standard: 100 req/min
app.use('/api/reports', apiLimiter, reportsRoutes);         // standard: 100 req/min

// ── Serve Frontend Static Files ──────────────
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// ── Error Handling ───────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ─────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const startServer = (port) => {
    const server = app.listen(port);

    server.on('listening', () => {
      console.log(`\n🚗 SpeedxSafety Backend is running on port ${port}`);
      console.log(`📡 API Base URL: http://localhost:${port}/api`);
      console.log(`💚 Health Check: http://localhost:${port}/api/health`);
      console.log(`\n── Available Endpoints ──────────────────`);
      console.log(`  POST   /api/auth/register`);
      console.log(`  POST   /api/auth/login`);
      console.log(`  GET    /api/teens`);
      console.log(`  GET    /api/teens/:id`);
      console.log(`  PUT    /api/teens/:id`);
      console.log(`  GET    /api/teens/:id/location`);
      console.log(`  POST   /api/teens/:id/location`);
      console.log(`  GET    /api/trips`);
      console.log(`  GET    /api/trips/teen/:teenId`);
      console.log(`  GET    /api/trips/:id`);
      console.log(`  POST   /api/trips`);
      console.log(`  GET    /api/alerts`);
      console.log(`  POST   /api/alerts`);
      console.log(`  PATCH  /api/alerts/:id/read`);
      console.log(`  PATCH  /api/alerts/read-all`);
      console.log(`  DELETE /api/alerts/:id`);
      console.log(`  GET    /api/geofences`);
      console.log(`  POST   /api/geofences`);
      console.log(`  PUT    /api/geofences/:id`);
      console.log(`  DELETE /api/geofences/:id`);
      console.log(`  POST   /api/geofences/check`);
      console.log(`  GET    /api/badges`);
      console.log(`  GET    /api/badges/teen/:teenId`);
      console.log(`  GET    /api/badges/:id`);
      console.log(`  GET    /api/reports/weekly/:teenId`);
      console.log(`  GET    /api/reports/summary/:teenId`);
      console.log(`────────────────────────────────────────\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.error(`\n⚠️  Port ${port} is already in use.`);
        console.error(`   To find the blocking process, run:`);
        console.error(`     netstat -ano | findstr :${port}   (Windows)`);
        console.error(`     lsof -i :${port}                  (macOS/Linux)`);
        console.error(`   Then kill it with: taskkill /PID <PID> /F`);
        console.log(`\n🔄 Retrying on port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('\n❌ Server failed to start:', err.message);
        process.exit(1);
      }
    });

    // ── Graceful Shutdown ────────────────────────
    const shutdown = (signal) => {
      console.log(`\n⚡ Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ All connections closed. Goodbye!');
        process.exit(0);
      });

      // Force exit if connections aren't closed within 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown — connections did not close in time.');
        process.exit(1);
      }, 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  };

  startServer(PORT);
}

// Export for Vercel
module.exports = app;
