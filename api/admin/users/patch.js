import { requireAuth, logAuditAction } from '../../_middleware/auth.js'
import { getSupabaseAdmin } from '../../_lib/env.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const adminUser = await requireAuth(req, res, 'admin')
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress

    const { targetUserId, updates } = req.body
    if (!targetUserId || !updates) {
      return res.status(400).json({ error: 'Missing targetUserId or updates object' })
    }

    const supabase = getSupabaseAdmin()

    // Only allow updating safe fields — never allow setting is_admin via this route
    const safeUpdates = {}
    if (updates.plan !== undefined) safeUpdates.plan = updates.plan
    if (updates.status !== undefined) safeUpdates.status = updates.status
    if (updates.points !== undefined) safeUpdates.points = updates.points
    if (updates.streak !== undefined) safeUpdates.streak = updates.streak

    const { error } = await supabase
      .from('profiles')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)

    if (error) throw error

    await logAuditAction(adminUser.id, 'ADMIN_PATCH_USER', targetUserId, ip, { updates: safeUpdates })

    return res.status(200).json({ success: true, message: 'User updated and action audited.' })
  } catch (err) {
    if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
      console.error('[Admin Patch Error]', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
