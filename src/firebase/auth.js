// Firebase Auth Service — PrepBridge
import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
  RecaptchaVerifier, signInWithPhoneNumber,
  sendPasswordResetEmail
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { auth, googleProvider, db } from './config'
import { useUserStore } from '../store/useStore'

// ─── Sign in with Google ────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user
  await ensureUserDoc(user)
  return user
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
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {},
    })
  }
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
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

// ─── Auth State Observer ────────────────────────────────────────
export function initAuthObserver() {
  return onAuthStateChanged(auth, async (user) => {
    const store = useUserStore.getState()
    if (user) {
      const profile = await getUserProfile(user.uid)
      store.setUser({
        uid: user.uid,
        email: user.email,
        phone: user.phoneNumber,
        displayName: user.displayName,
        isAdmin: user.email === 'admin@prepbridge.in',
      })
      if (profile) {
        store.setProfile(profile)
        store.setOnboardingComplete(profile.onboardingComplete || false)
        store.setIsAdmin(profile.isAdmin || user.email === 'admin@prepbridge.in')
      }
    } else {
      store.logout()
    }
  })
}
