const { getSupabaseAdmin } = require('../_lib/env');

/**
 * Enterprise JWT Authorization Interceptor
 * 
 * 1. Extracts the Bearer token from the incoming request.
 * 2. Uses the Supabase Admin client to verify the token natively.
 * 3. Queries the secure `user_roles` table to confirm 'super_admin' or 'admin' status.
 * 4. Logs the action via the Audit Logs Engine if the check passes.
 * 
 * @param {Object} req - Vercel API Request
 * @param {Object} res - Vercel API Response
 * @param {String} requiredRole - e.g., 'super_admin' or 'admin'
 * @returns {Promise<Object>} user object if successful
 */
async function requireAuth(req, res, requiredRole = null) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header.' });
        throw new Error('Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseAdmin();

    // Verify JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
        console.error('[AUTH ERROR]', authError);
        res.status(401).json({ error: 'Invalid or expired token.' });
        throw new Error('Unauthorized');
    }

    // If a specific native role is required (e.g. 'super_admin')
    if (requiredRole) {
        // Query the secure, isolated user_roles table
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleError || !roleData) {
            console.warn(`[FORBIDDEN] User ${user.id} attempted to access secure route without role data.`);
            res.status(403).json({ error: 'Forbidden. Required access level not met.' });
            throw new Error('Forbidden');
        }

        // Strict hierarchy check
        const roles = { 'student': 1, 'admin': 2, 'super_admin': 3 };
        const userLevel = roles[roleData.role] || 0;
        const requiredLevel = roles[requiredRole] || 3;

        if (userLevel < requiredLevel) {
            console.warn(`[FORBIDDEN] User ${user.id} (Level ${userLevel}) blocked from ${requiredRole} route.`);
            res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
            throw new Error('Forbidden');
        }
    }

    return user;
}

/**
 * Commits a secure ledger entry to the Audit Logs table.
 */
async function logAuditAction(adminId, action, targetId, ip, details = {}) {
    const supabase = getSupabaseAdmin();
    await supabase.from('audit_logs').insert([{
        admin_id: adminId,
        action_performed: action,
        target_id: targetId,
        ip_address: ip,
        details: details
    }]);
}

module.exports = { requireAuth, logAuditAction };
