// Firebase Configuration — PrepBridge 2.0
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getMessaging, isSupported as messagingSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyBphAmrAzMyHn4n4PQ0GQ9Ixj0xnWhVmZk",
  authDomain: "prepbridge-85189.firebaseapp.com",
  projectId: "prepbridge-85189",
  storageBucket: "prepbridge-85189.firebasestorage.app",
  messagingSenderId: "1074613140786",
  appId: "1:1074613140786:web:6092d00d86da43c8426b2b",
  measurementId: "G-7PSG8ERREH"
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
