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
  doc, setDoc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { auth, googleProvider, db } from './config'
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

// ─── Firestore User Document ────────────────────────────────────
export async function createUserDoc(user, extra = {}) {
  const ref = doc(db, 'users', user.uid)
  await setDoc(ref, {
    uid: user.uid,
    email: user.email || null,
    phone: user.phoneNumber || null,
    displayName: user.displayName || extra.name || null,
    photoURL: user.photoURL || null,
    isAdmin: user.email === 'admin@prepbridge.in',
    subscription: { plan: 'free', startDate: serverTimestamp() },
    onboardingComplete: false,
    language: 'en',
    exams: [],
    state: null,
    points: 0,
    streak: 0,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    ...extra
  }, { merge: true })
}

export async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await createUserDoc(user)
  } else {
    await updateDoc(ref, { lastActive: serverTimestamp() })
  }
  return snap.data() || {}
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

// ─── Auth State Observer & Redirect Result Capture ───────────────
export function initAuthObserver() {
  // Capture Google Redirect result on app mount
  getRedirectResult(auth)
    .then(async (result) => {
      if (result && result.user) {
        console.log('[Auth] Google Redirect successful for:', result.user.email)
        await ensureUserDoc(result.user)
      }
    })
    .catch((error) => {
      console.error('[Auth] Google Redirect error:', error)
    })

  return onAuthStateChanged(auth, async (user) => {
    const store = useUserStore.getState()
    if (user) {
      store.setUser({
        uid: user.uid,
        email: user.email,
        phone: user.phoneNumber,
        displayName: user.displayName,
        isAdmin: user.email === 'admin@prepbridge.in',
      })

      try {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          store.setProfile(profile)
          store.setOnboardingComplete(profile.onboardingComplete || false)
          store.setIsAdmin(profile.isAdmin || user.email === 'admin@prepbridge.in')
        } else {
          // Document doesn't exist yet, set a fallback profile
          store.setProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Aspirant',
            onboardingComplete: false
          })
        }
      } catch (err) {
        console.warn('[Auth] Firestore profile loading failed, using offline fallback:', err.message)
        // If Firestore is offline or fails, keep the user authenticated using cached/offline profile
        const offlineProfile = store.profile || {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Aspirant',
          onboardingComplete: false
        }
        store.setProfile(offlineProfile)
      }
    } else {
      store.logout()
    }
  })
}
