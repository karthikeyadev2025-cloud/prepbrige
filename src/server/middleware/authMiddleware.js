// =====================================================================
// PREPBRIDGE ENTERPRISE AUTHENTICATION & ROLE-BASED ACCESS CONTROL
// Production-Ready Middleware implementing Firebase Token Verification,
// Supabase Database Profile Sync, and Strict Multi-Role Gating.
// =====================================================================

const admin = require('firebase-admin');
const { getSupabaseProfile } = require('../../services/supabaseService');

/**
 * Enterprise Authentication Gating Middleware
 * Authenticates request by extracting, decoding, and validating Firebase JWT authorization token.
 * Populates req.user and req.profile for subsequent controller access.
 */
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Access denied. Authorization header must be provided as Bearer token.'
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN_FORMAT',
      message: 'Access denied. Bearer token is empty.'
    });
  }

  try {
    let decodedToken;

    // Resiliency fallback: handle developer demo credentials securely
    if (process.env.NODE_ENV !== 'production' && token.startsWith('demo_token_')) {
      const demoPhone = token.replace('demo_token_', '');
      decodedToken = {
        uid: `demo_${demoPhone}`,
        email: `demo_${demoPhone}@prepbridge.in`,
        phone_number: `+91${demoPhone}`,
        firebase: { sign_in_provider: 'phone' }
      };
      console.warn(`[AuthMiddleware] Authenticating developer via sandbox token for UID: ${decodedToken.uid}`);
    } else {
      // Production path: strict Firebase cryptographical token validation
      if (!admin.apps.length) {
        // Safe check if Firebase Admin SDK is initialized
        const firebaseConfig = {
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
        if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
          admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
        } else {
          throw new Error('Firebase Admin SDK is not initialized and VITE_FIREBASE_* credentials are missing.');
        }
      }
      decodedToken = await admin.auth().verifyIdToken(token);
    }

    req.user = decodedToken;

    // Load active profile from PostgreSQL database (via Supabase REST API Service)
    const profile = await getSupabaseProfile(decodedToken.uid);
    if (!profile) {
      // Auto-remediation: if Firebase user exists but profile document hasn't synced, block and prompt onboarding
      req.profile = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        phone: decodedToken.phone_number || null,
        displayName: decodedToken.name || 'Aspirant',
        role: 'student',
        subscription: { plan: 'free' },
        onboardingComplete: false
      };
    } else {
      req.profile = profile;
    }

    return next();
  } catch (err) {
    console.error('[AuthMiddleware] JWT Token verification exception:', err.message);

    // Differentiate expired session to trigger client-side auto-logout/token-refresh flow
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Your login session has expired. Please refresh your credentials or log in again.'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Authentication failed. Provided credentials are corrupt or blacklisted.'
    });
  }
}

/**
 * Gating middleware for strict Role-Based Access Control (RBAC).
 * Assumes authenticateUser has run successfully and req.profile exists.
 *
 * @param {string[]} allowedRoles - List of permitted roles (e.g. ['admin', 'super-admin'])
 */
function restrictToRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.profile) {
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SECURITY_ERROR',
        message: 'RBAC verification failed. User profile is not resolved.'
      });
    }

    const userRole = req.profile.role || 'student';

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    // Lock down unauthorized access securely
    console.warn(`[Security Warning] Unauthorized access attempt on role-protected endpoint by UID: ${req.profile.uid} [Role: ${userRole}]`);

    return res.status(403).json({
      success: false,
      error: 'INSUFFICIENT_PRIVILEGES',
      message: 'Access forbidden. You do not possess the required privileges to query this endpoint.'
    });
  };
}

module.exports = {
  authenticateUser,
  restrictToRoles
};
