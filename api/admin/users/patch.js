const { requireAuth, logAuditAction } = require('../../_middleware/auth');
const { getSupabaseAdmin } = require('../../_lib/env');

/**
 * SUPER ADMIN ROUTE: Force-Patch User Status
 * 
 * Allows a Super Admin to manually override a user's subscription status, 
 * terminate them, or update points.
 * 
 * METHOD: POST
 * REQUIRED ROLE: super_admin
 */
module.exports = async function handler(req, res) {
    // Handle CORS preflight explicitly
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Strict Authorization Gate
        const adminUser = await requireAuth(req, res, 'super_admin');
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // 2. Validate Payload
        const { targetUserId, updates } = req.body;
        
        if (!targetUserId || !updates) {
            return res.status(400).json({ error: 'Missing targetUserId or updates object' });
        }

        const supabase = getSupabaseAdmin();

        // 3. Admin action executed securely via Server Role
        // Example: updating a user's custom metadata (which acts as their public profile/subscription state)
        const { data, error } = await supabase.auth.admin.updateUserById(
            targetUserId,
            { user_metadata: updates }
        );

        if (error) throw error;

        // 4. Immutable Audit Ledger Log
        await logAuditAction(
            adminUser.id, 
            'FORCE_PATCH_USER_METADATA', 
            targetUserId, 
            ip, 
            { updates_applied: updates }
        );

        return res.status(200).json({ 
            success: true, 
            message: 'User forcefully updated and action audited.',
            user: data.user.id
        });

    } catch (err) {
        // Errors thrown by requireAuth are already resolved with HTTP codes
        if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
            console.error('[ADMIN PATCH ERROR]', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
