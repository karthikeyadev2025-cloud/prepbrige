// Firebase Auth Service — PrepBridge
import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
  RecaptchaVerifier, signInWithPhoneNumber,
  sendPasswordResetEmail,
  signInWithRedirect, getRedirectResult
} from 'firebase/auth'
import {
  getSupabaseProfile,
  upsertSupabaseProfile
} from '../services/supabaseService'
import { auth, googleProvider } from './config'
import { useUserStore } from '../store/useStore'

// ─── Sign in with Google (Resilient Dual-Mode Auth) ────────────────
export async function signInWithGoogle() {
  try {
    // Attempt popup login first to maintain page state on custom domains
    const result = await signInWithPopup(auth, googleProvider)
    await ensureUserDoc(result.user)
    return result.user
  } catch (error) {
    console.warn('[Auth] signInWithPopup failed, falling back to signInWithRedirect:', error.message)
    // Fallback to redirect authentication if popup is blocked or triggers COOP error
    await signInWithRedirect(auth, googleProvider)
  }
}

// ─── Email/Password Auth ────────────────────────────────────────
export async function signInEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserDoc(result.user)
  return result.user
}

export async function signUpEmail(email, password, name) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: name })
  await createUserDoc(result.user, { name })
  return result.user
}

// ─── Phone OTP Auth ─────────────────────────────────────────────
export function setupRecaptcha(elementId) {
  const container = document.getElementById(elementId)
  if (!container) return null

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear()
    } catch (e) {
      console.warn('[Auth] Error clearing stale recaptcha:', e)
    }
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {},
  })
  
  return window.recaptchaVerifier
}

export async function sendOTP(phoneNumber) {
  const appVerifier = window.recaptchaVerifier
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  window.confirmationResult = confirmation
  return confirmation
}

export async function verifyOTP(code) {
  const result = await window.confirmationResult.confirm(code)
  await ensureUserDoc(result.user)
  return result.user
}

// ─── Sign Out ───────────────────────────────────────────────────
export async function signOutUser() {
  await signOut(auth)
  useUserStore.getState().logout()
}

// ─── Password Reset ─────────────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

// ─── Supabase User Document ─────────────────────────────────────
export async function createUserDoc(user, extra = {}) {
  const payload = {
    uid: user.uid,
    email: user.email || null,
    phone: user.phoneNumber || null,
    displayName: user.displayName || extra.name || null,
    photoURL: user.photoURL || null,
    isAdmin: user.email === 'admin@prepbridge.in',
    subscription: { plan: 'free' },
    onboardingComplete: false,
    language: 'en',
    exams: [],
    state: null,
    points: 0,
    streak: 0,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ...extra
  }
  
  await upsertSupabaseProfile(user.uid, payload)
}

export async function ensureUserDoc(user) {
  let profile = await getSupabaseProfile(user.uid)
  if (!profile) {
    await createUserDoc(user)
    profile = await getSupabaseProfile(user.uid)
  } else {
    await upsertSupabaseProfile(user.uid, { ...profile, lastActive: new Date().toISOString() })
  }
  return profile || {}
}

export async function getUserProfile(uid) {
  return await getSupabaseProfile(uid)
}

export async function updateUserProfile(uid, data) {
  const existing = await getSupabaseProfile(uid) || {}
  await upsertSupabaseProfile(uid, { ...existing, ...data })
}

// ─── Auth State Observer & Redirect Result Capture ───────────────
let _authObserverUnsubscribe = null

export function initAuthObserver() {
  // Prevent duplicate registrations (called once from main.jsx)
  if (_authObserverUnsubscribe) return _authObserverUnsubscribe

  // Capture Google Redirect result on app mount
  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        console.log('[Auth] Google Redirect successful for:', result.user.email)
        await ensureUserDoc(result.user)
      }
    })
    .catch((error) => {
      // auth/null-user is expected when no redirect happened — suppress it
      if (error.code !== 'auth/null-user') {
        console.error('[Auth] Google Redirect error:', error)
      }
    })

  _authObserverUnsubscribe = onAuthStateChanged(auth, async (user) => {
    const store = useUserStore.getState()
    if (user) {
      // Determine admin status — email check is the reliable server-side source
      // profile.isAdmin from Supabase is also checked as a secondary source
      const emailIsAdmin = user.email === 'admin@prepbridge.in'

      store.setUser({
        uid: user.uid,
        email: user.email,
        phone: user.phoneNumber,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: emailIsAdmin,
      })

      try {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          const isAdmin = profile.isAdmin || emailIsAdmin
          store.setProfile({ ...profile, isAdmin })
          store.setOnboardingComplete(profile.onboardingComplete || isAdmin)
          store.setIsAdmin(isAdmin)
        } else {
          // New user — no profile yet (will be created during onboarding)
          store.setProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Aspirant',
            photoURL: user.photoURL || null,
            onboardingComplete: emailIsAdmin,
            isAdmin: emailIsAdmin,
          })
          store.setOnboardingComplete(emailIsAdmin)
          store.setIsAdmin(emailIsAdmin)
        }
      } catch (err) {
        console.warn('[Auth] Supabase profile load failed, using offline fallback:', err.message)
        const offlineProfile = store.profile || {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Aspirant',
          onboardingComplete: emailIsAdmin,
          isAdmin: emailIsAdmin,
        }
        store.setProfile(offlineProfile)
        store.setOnboardingComplete(offlineProfile.onboardingComplete || emailIsAdmin)
        store.setIsAdmin(offlineProfile.isAdmin || emailIsAdmin)
      }
    } else {
      // Only logout if not a demo session (demo users have no Firebase user)
      if (!store.user?.uid?.startsWith('demo_')) {
        store.logout()
      }
    }
  })

  return _authObserverUnsubscribe
}
