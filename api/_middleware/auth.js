import { getSupabaseAdmin } from '../_lib/env.js'

export async function requireAuth(req, res, requiredRole = null) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' })
    throw new Error('Unauthorized')
  }

  const token = authHeader.split(' ')[1]
  const supabase = getSupabaseAdmin()

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    res.status(401).json({ error: 'Invalid or expired token.' })
    throw new Error('Unauthorized')
  }

  if (requiredRole) {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError || !roleData) {
      res.status(403).json({ error: 'Forbidden. Required access level not met.' })
      throw new Error('Forbidden')
    }

    const roles = { student: 1, admin: 2, super_admin: 3 }
    if ((roles[roleData.role] || 0) < (roles[requiredRole] || 3)) {
      res.status(403).json({ error: 'Forbidden. Insufficient permissions.' })
      throw new Error('Forbidden')
    }
  }

  return user
}

export async function logAuditAction(adminId, action, targetId, ip, details = {}) {
  const supabase = getSupabaseAdmin()
  await supabase.from('audit_logs').insert([{
    admin_id: adminId,
    action_performed: action,
    target_id: targetId,
    ip_address: ip,
    details
  }])
}
