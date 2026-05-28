const { createClient } = require('@supabase/supabase-js');

/**
 * Enterprise Secret Orchestrator & Circuit Breaker
 * Validates the presence of live production keys before allowing any route execution.
 * 
 * STRICT SECRET ISOLATION:
 * The SUPABASE_SERVICE_ROLE_KEY is used here to bypass RLS for server-side evaluation and 
 * admin overrides. Because this file resides in the `/api` directory and does NOT use 
 * the `VITE_` prefix, it is guaranteed by the bundler to NEVER bleed into the client-side build.
 */

function validateEnv() {
    const requiredKeys = [
        'VITE_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missing = requiredKeys.filter(key => !process.env[key]);

    if (missing.length > 0) {
        // Circuit Breaker: Failsafe gracefully before attempting database connection
        console.error(`[CRITICAL] Missing required environment variables: ${missing.join(', ')}`);
        throw new Error("Server Misconfiguration: Secrets not isolated properly.");
    }

    return {
        supabaseUrl: process.env.VITE_SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
}

let supabaseAdminClient = null;

function getSupabaseAdmin() {
    if (!supabaseAdminClient) {
        const env = validateEnv();
        supabaseAdminClient = createClient(env.supabaseUrl, env.serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return supabaseAdminClient;
}

module.exports = { getSupabaseAdmin, validateEnv };
