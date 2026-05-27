// Firebase Configuration — PrepBridge 2.0
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getMessaging, isSupported as messagingSupported } from 'firebase/messaging'

// Guard: if env vars are missing (Vercel build without VITE_* set), fail clearly
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
if (!apiKey) {
  console.error(
    '[PrepBridge] VITE_FIREBASE_API_KEY is not set.\n' +
    'Go to Vercel → Project Settings → Environment Variables and add all VITE_FIREBASE_* vars, then Redeploy.'
  )
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || '',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Auth
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
export const phoneProvider = new PhoneAuthProvider(auth)

// Firestore
export const db = getFirestore(app)

// Storage
export const storage = getStorage(app)

// Analytics (only in browser)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null)

// Messaging (push notifications)
export const getMessagingInstance = async () => {
  const supported = await messagingSupported()
  if (supported) {
    return getMessaging(app)
  }
  return null
}

export default app
