import { createClient } from '@supabase/supabase-js'

// Server-side Supabase admin client using service role key (bypasses RLS)
// This file is in /api — never bundled into client code

function validateEnv() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server Misconfiguration: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing.')
  }

  return { supabaseUrl, serviceRoleKey }
}

let supabaseAdminClient = null

export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const { supabaseUrl, serviceRoleKey } = validateEnv()
    supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return supabaseAdminClient
}
