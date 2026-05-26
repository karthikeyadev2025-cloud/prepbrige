// Supabase Storage REST API Service — PrepBridge
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Uploads a file directly to Supabase Storage using lightweight native REST API.
 * Pulls credentials live from Firestore settings, with local storage and prefilled fallbacks.
 *
 * @param {File} file - The file to upload
 * @param {string} path - Target path in the bucket (e.g. 'profile_photos/user123')
 * @returns {Promise<string>} - The public, accessible CDN URL of the uploaded asset
 */
export async function uploadToSupabase(file, path) {
  let supabaseUrl = 'https://stmnmxkosnxbckvqojxw.supabase.co'
  let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bW5teGtvc254YmNrdnFvanh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODgwOTcsImV4cCI6MjA5NTM2NDA5N30.37fJYUOxQs6gvgZYzSkOOWMvaY1qKsZheIKicsr_G5w'
  let supabaseBucket = 'profile_photos'

  try {
    // 2. Fetch live settings from firestore
    const docRef = doc(db, 'settings', 'integrations')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.supabaseUrl) supabaseUrl = data.supabaseUrl
      if (data.supabaseAnonKey) supabaseAnonKey = data.supabaseAnonKey
      if (data.supabaseBucket) supabaseBucket = data.supabaseBucket
    } else {
      // LocalStorage cache fallback
      const local = localStorage.getItem('prepbridge_admin_settings')
      if (local) {
        const data = JSON.parse(local)
        if (data.supabaseUrl) supabaseUrl = data.supabaseUrl
        if (data.supabaseAnonKey) supabaseAnonKey = data.supabaseAnonKey
        if (data.supabaseBucket) supabaseBucket = data.supabaseBucket
      }
    }
  } catch (e) {
    console.warn('Failed to fetch live Supabase configuration, trying local cache:', e)
    const local = localStorage.getItem('prepbridge_admin_settings')
    if (local) {
      try {
        const data = JSON.parse(local)
        if (data.supabaseUrl) supabaseUrl = data.supabaseUrl
        if (data.supabaseAnonKey) supabaseAnonKey = data.supabaseAnonKey
        if (data.supabaseBucket) supabaseBucket = data.supabaseBucket
      } catch (err) {
        console.error('Error parsing cached admin settings:', err)
      }
    }
  }

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
