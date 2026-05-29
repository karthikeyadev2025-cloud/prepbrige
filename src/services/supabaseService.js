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
import { apiClient } from '../api/client';

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

  await response.json()

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

/**
 * Fetches test templates for a specific exam from Supabase.
 */
export async function getSupabaseTestTemplates(examId) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  
  let dbUrl = `${cleanUrl}/rest/v1/test_templates?select=*`
  if (examId) {
    dbUrl += `&exam_id=eq.${examId}`
  }

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
      return data.map(t => ({
        id: t.id,
        title: t.title,
        exam: t.exam_id,
        totalQuestions: t.total_marks, // approximate for UI
        duration: t.duration_minutes,
        pattern: 'MCQ',
        negativeMarking: -0.25,
        marksPerQuestion: 1,
        syllabus: ['General'],
        attempts: 0,
        avgScore: 0,
        difficulty: 'medium'
      }))
    }
  } catch (err) {
  }

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
      return data.map(t => ({
        id: t.id,
        title: t.title,
        exam: t.exam_id,
        totalQuestions: t.total_marks,
        duration: t.duration_minutes,
        pattern: 'MCQ',
        negativeMarking: -0.25,
        marksPerQuestion: 1,
        syllabus: ['General'],
        attempts: 0,
        avgScore: 0,
        difficulty: 'medium'
      }))
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseTestTemplates failed:', err)
  }
  return []
}

/**
 * Fetches the count of questions available for an exam.
 */
export async function getSupabaseQuestionsCount(examId) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  let dbUrl = `${cleanUrl}/rest/v1/question_exam_mapping?select=question_id`
  if (examId) {
    dbUrl += `&exam_id=eq.${examId}`
  }

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
      return data.length
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseQuestionsCount failed:', err)
  }
  return 0
}

/**
 * Fetches latest current affairs from Supabase.
 */
export async function getSupabaseCurrentAffairs() {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  const dbUrl = `${cleanUrl}/rest/v1/current_affairs?select=*&order=article_date.desc&limit=10`

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
      return data.map(ca => ({
        id: ca.id,
        title: ca.title,
        summary: ca.summary,
        category: ca.category,
        source: ca.source,
        importance: ca.importance,
        date: ca.article_date
      }))
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseCurrentAffairs failed:', err)
  }
  return []
}

/**
 * Fetches dynamic study points based on exam target.
 */
export async function getSupabaseStudyPoints(examId) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  
  let dbUrl = `${cleanUrl}/rest/v1/study_points?select=*`
  if (examId) {
    dbUrl += `&exam_id=eq.${examId}`
  }

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
      return data.reduce((acc, curr) => {
        acc[curr.topic] = {
          topic: curr.topic,
          points: curr.points,
          tip: curr.tip,
          mnemonic: curr.mnemonic,
          pyq: curr.pyq
        }
        return acc
      }, {})
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseStudyPoints failed:', err)
  }
  return {}
}

/**
 * Fetches a single random/daily question for the exam.
 */
export async function getSupabaseDailyQuiz(examId) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  let dbUrl = `${cleanUrl}/rest/v1/question_exam_mapping?select=questions(*)&limit=1`
  if (examId) {
    dbUrl += `&exam_id=eq.${examId}`
  }

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
      if (data && data.length > 0 && data[0].questions) {
        return {
          id: data[0].questions.id,
          text: data[0].questions.question_text,
          options: (data[0].questions.options || []).map(o => o.text),
          correct: data[0].questions.correct_option_id,
          explanation: data[0].questions.explanation,
          subject: data[0].questions.subject_id
        }
      }
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseDailyQuiz failed:', err)
  }
  return null
}

/**
 * Fetches multiple questions for a mock test.
 */
export async function getSupabaseExamQuestions(examId, limit = 20) {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials()
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, '')
  let dbUrl = `${cleanUrl}/rest/v1/question_exam_mapping?select=questions(*)&limit=${limit}`
  if (examId) {
    dbUrl += `&exam_id=eq.${examId}`
  }

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
      return data.filter(d => d.questions).map((d, index) => ({
        id: d.questions.id,
        text: d.questions.question_text,
        options: (d.questions.options || []).map(o => o.text),
        correct: d.questions.correct_option_id,
        explanation: d.questions.explanation,
        subject: d.questions.subject_id,
        num: index + 1
      }))
    }
  } catch (err) {
    console.error('[Supabase DB] getSupabaseExamQuestions failed:', err)
  }
  return []
}
