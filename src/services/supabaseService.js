// Supabase Storage REST API Service — PrepBridge

// Default credentials from environment variables (never hardcode secrets in source)
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const DEFAULT_SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'profile_photos'

/** Read Supabase credentials: admin localStorage overrides env defaults */
function getSupabaseCredentials(overrideBucket = false) {
  let url = DEFAULT_SUPABASE_URL
  let anonKey = DEFAULT_SUPABASE_ANON_KEY
  let bucket = DEFAULT_SUPABASE_BUCKET
  try {
    const local = localStorage.getItem('prepbridge_admin_settings')
    if (local) {
      const data = JSON.parse(local)
      if (data.supabaseUrl) url = data.supabaseUrl
      if (data.supabaseAnonKey) anonKey = data.supabaseAnonKey
      if (overrideBucket && data.supabaseBucket) bucket = data.supabaseBucket
    }
  } catch { // ignore JSON parse errors
  }
  return { url, anonKey, bucket }
}

/**
 * Uploads a file directly to Supabase Storage using lightweight native REST API.
 * Pulls credentials live from local settings cache with fallback.
 *
 * @param {File} file - The file to upload
 * @param {string} path - Target path in the bucket (e.g. 'profile_photos/user123')
 * @returns {Promise<string>} - The public, accessible CDN URL of the uploaded asset
 */
export async function uploadToSupabase(file, path) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey, bucket: supabaseBucket } = getSupabaseCredentials(true)

  // Normalize url
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const cleanBucket = supabaseBucket.trim()
  const cleanPath = path.trim()

  if (!cleanUrl || !cleanAnonKeyExists(supabaseAnonKey)) {
    throw new Error('Supabase URL or Anon API Key is not fully configured in the Admin Integrations dashboard.')
  }

  // Construct target REST endpoint
  const uploadUrl = `${cleanUrl}/storage/v1/object/${cleanBucket}/${cleanPath}`

  console.log(`[Supabase Storage] Uploading ${file.name} to bucket: ${cleanBucket}...`)

  // Perform upload via native fetch with x-upsert to allow overwrites
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'true' // upsert/overwrite if file already exists
    },
    body: file
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Supabase Upload HTTP ${response.status}: ${errText || response.statusText}`)
  }

  const result = await response.json()
  console.log('[Supabase Storage] Success:', result)

  // Construct Public CDN URL
  return `${cleanUrl}/storage/v1/object/public/${cleanBucket}/${cleanPath}`
}

function cleanAnonKeyExists(key) {
  if (!key) return false
  const trimmed = key.trim()
  return trimmed.length > 20 && !trimmed.includes('•••')
}

/**
 * Synchronizes user profile details directly to Supabase Database (PostgreSQL profiles table)
 * via PostgREST lightweight native API.
 * 
 * @param {string} uid - The user's UID
 * @param {object} profileData - The complete profile data to synchronize
 */
export async function syncProfileToSupabase(uid, profileData) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()

  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  
  if (!cleanUrl || !cleanAnonKeyExists(supabaseAnonKey)) {
    console.warn('[Supabase DB] Credentials not fully configured. Skipping sync.')
    return
  }

  const dbUrl = `${cleanUrl}/rest/v1/profiles`
  console.log(`[Supabase DB] Synchronizing profile for: ${uid}...`)

  const payload = {
    id: uid,
    email: profileData.email || null,
    phone: profileData.phone || null,
    display_name: profileData.name || 'Anonymous User',
    state: profileData.state || 'N/A',
    exams: profileData.exams || [],
    primary_target: profileData.primaryTarget || null,
    lakshya_slogan: profileData.lakshyaSlogan || null,
    selected_language: profileData.selectedLanguage || 'English',
    education: profileData.education || 'N/A',
    study_hours: profileData.studyHours || 'N/A',
    points: profileData.points || 0,
    streak: profileData.streak || 0,
    updated_at: new Date().toISOString()
  }

  try {
    const response = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // PostgREST upsert flag
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[Supabase DB] Sync failed (HTTP ${response.status}): ${errText}`)
    } else {
      console.log('[Supabase DB] Success: Profile synced.')
    }
  } catch (err) {
    console.error('[Supabase DB] Sync request error:', err)
  }
}

/**
 * Fetches administrative settings from Supabase Database settings table.
 * Falls back to local storage cache if database is offline or unconfigured.
 */
export async function getSupabaseSettings() {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()

  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const dbUrl = `${cleanUrl}/rest/v1/settings?key=eq.integrations&select=value`

  try {
    const response = await fetch(dbUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        return data[0].value
      }
    } else {
      console.warn(`[Supabase DB] Settings fetch failed (HTTP ${response.status})`)
    }
  } catch (err) {
    console.error('[Supabase DB] Failed to fetch settings:', err)
  }
  return null
}

/**
 * Saves integrations settings to Supabase Database settings table.
 */
export async function saveSupabaseSettings(settingsData) {
  const { url: defaultUrl, anonKey: defaultKey } = getSupabaseCredentials()
  const supabaseUrl = settingsData.supabaseUrl || defaultUrl
  const supabaseAnonKey = settingsData.supabaseAnonKey || defaultKey

  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const dbUrl = `${cleanUrl}/rest/v1/settings`
  const payload = {
    key: 'integrations',
    value: settingsData,
    updated_at: new Date().toISOString()
  }

  const response = await fetch(dbUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Supabase settings save failed: ${errText}`)
  }
}

/**
 * Fetches user profile from Supabase Database profiles table.
 */
export async function getSupabaseProfile(uid) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()

  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const dbUrl = `${cleanUrl}/rest/v1/profiles?id=eq.${uid}&select=*`

  try {
    const response = await fetch(dbUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        const p = data[0]
        return {
          uid: p.id,
          email: p.email,
          phone: p.phone,
          displayName: p.display_name,
          photoURL: p.photo_url,
          state: p.state === 'N/A' ? null : p.state,
          exams: p.exams || [],
          primaryTarget: p.primary_target,
          lakshyaSlogan: p.lakshya_slogan,
          selectedLanguage: p.selected_language,
          education: p.education,
          studyHours: p.study_hours,
          points: p.points || 0,
          streak: p.streak || 0,
          isAdmin: p.is_admin || false,
          onboardingComplete: p.onboarding_complete || false,
          subscription: { plan: p.plan || 'free' },
          status: p.status || 'active',
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          lastActive: p.last_active,
          fcmToken: p.fcm_token,
          pushNotificationsEnabled: p.push_notifications_enabled,
          pushSubscriptionDate: p.push_subscription_date
        }
      }
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseProfile failed:', err)
  }
  return null
}

/**
 * Upserts a user profile into Supabase Database profiles table.
 */
export async function upsertSupabaseProfile(uid, data) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()

  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const dbUrl = `${cleanUrl}/rest/v1/profiles`
  
  const exams = data.exams || []
  const plan = data.subscription?.plan || data.plan || 'free'

  const payload = {
    id: uid,
    email: data.email || null,
    phone: data.phone || data.phoneNumber || null,
    display_name: data.displayName || data.name || 'Anonymous User',
    photo_url: data.photoURL || null,
    state: data.state || 'N/A',
    exams: exams,
    primary_target: data.primaryTarget || null,
    lakshya_slogan: data.lakshyaSlogan || null,
    selected_language: data.selectedLanguage || data.language || 'English',
    education: data.education || 'N/A',
    study_hours: data.studyHours || 'N/A',
    points: data.points || 0,
    streak: data.streak || 0,
    is_admin: data.isAdmin || false,
    onboarding_complete: data.onboardingComplete || false,
    plan: plan,
    status: data.status || 'active',
    updated_at: new Date().toISOString(),
    last_active: data.lastActive || new Date().toISOString(),
    fcm_token: data.fcmToken || null,
    push_notifications_enabled: data.pushNotificationsEnabled || false,
    push_subscription_date: data.pushSubscriptionDate || null
  }

  if (data.createdAt) {
    payload.created_at = typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt
  }

  const response = await fetch(dbUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`[Supabase DB] upsertSupabaseProfile failed (HTTP ${response.status}): ${errText}`)
    throw new Error(`Supabase profiles upsert failed: ${errText}`)
  }
}

/**
 * Fetches all user profiles from Supabase Database profiles table (for Admin Panel).
 */
export async function getAllSupabaseProfiles() {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()

  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const dbUrl = `${cleanUrl}/rest/v1/profiles?select=*`

  try {
    const response = await fetch(dbUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json'
      }
    })
    if (response.ok) {
      const list = await response.json()
      return list.map(p => ({
        id: p.id,
        name: p.display_name || 'Anonymous User',
        email: p.email || 'no-email@prepbridge.in',
        phone: p.phone || '+91 0000000000',
        state: p.state || 'N/A',
        exams: p.exams || [],
        joined: p.created_at,
        plan: p.plan || 'free',
        status: p.status || 'active',
        streak: p.streak || 0,
        tests: p.tests || 0,
        photoURL: p.photo_url || null,
        primaryTarget: p.primary_target || null,
        lakshyaSlogan: p.lakshya_slogan || null,
        selectedLanguage: p.selected_language || 'English',
        education: p.education || 'N/A',
        studyHours: p.study_hours || 'N/A'
      }))
    }
  } catch (err) {
    console.error('[Supabase DB] getAllSupabaseProfiles failed:', err)
  }
  return []
}

