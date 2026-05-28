// =====================================================================
// PREPBRIDGE PRODUCTION EXPRESS SERVER APPLICATION
// Configures secure headers, strict CORS, routing, and error boundaries.
// =====================================================================

const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const { authenticateUser, restrictToRoles } = require('./middleware/authMiddleware');
const { startAttempt, saveAnswers, submitTest } = require('./controllers/testController');

const app = express();

// Strict CORS Gating isolation exclusively to prepbridge.in & official subdomains
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server calls (e.g. scripts or Postman sandbox) in development
    if (config.nodeEnv !== 'production' && !origin) {
      return callback(null, true);
    }
    
    if (config.cors.allowedOrigins.includes(origin) || (origin && origin.endsWith('.prepbridge.in'))) {
      callback(null, true);
    } else {
      console.warn(`[Security Intervention] Blocked cross-origin request from malicious origin: ${origin}`);
      callback(new Error('CORS blocked. Origin is unauthorized.'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Standard Liveness Probe (health check)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// API Routes with strict token decoding & RBAC roles gating
app.post('/api/tests/start', authenticateUser, startAttempt);
app.post('/api/tests/save', authenticateUser, saveAnswers);
app.post('/api/tests/submit', authenticateUser, submitTest);

// Admin-only test/analytics route as proof-of-work
app.get('/api/admin/audit-logs', authenticateUser, restrictToRoles(['admin', 'super-admin']), async (req, res) => {
  res.json({
    success: true,
    message: 'Audit logs resolved successfully.'
  });
});

// Global Error handling boundary
app.use((err, req, res, next) => {
  console.error('[Global Crash Boundary] Caught unhandled route exception:', err.message);
  
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: config.nodeEnv === 'production' ? 'An unexpected server exception occurred.' : err.message
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`[PrepBridge Server] Booted successfully. Listening on port ${config.port} [Mode: ${config.nodeEnv}]`);
  });
}

module.exports = app;
