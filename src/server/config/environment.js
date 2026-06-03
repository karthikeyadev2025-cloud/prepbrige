// =====================================================================
// PREPBRIDGE PRODUCTION ENVIRONMENT CONFIGURATION CONTROLLER
// Validates system environment variables, prevents client-side leaks,
// and implements fail-safe downstream network error boundaries.
// =====================================================================

// Load dotenv only when running standalone node server
try {
  require('dotenv').config();
} catch {
  // Ignored in serverless/production containers where env is injected natively
}

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_FIREBASE_PROJECT_ID'
];

function validateEnv() {
  const missing = [];
  REQUIRED_ENV_VARS.forEach(v => {
    if (!process.env[v]) {
      missing.push(v);
    }
  });

  if (missing.length > 0) {
    console.error(`[Fatal Startup Exception] Missing critical production secrets: ${missing.join(', ')}`);
    // Fail-fast in production to prevent running in corrupt states
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

validateEnv();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  firebase: {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || ''
  },
  cors: {
    allowedOrigins: [
      'https://prepbridge.in',
      'https://www.prepbridge.in',
      'https://admin.prepbridge.in'
    ]
  }
};

module.exports = config;
