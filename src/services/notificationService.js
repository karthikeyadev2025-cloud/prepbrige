// Firebase Web Push Notification Service — PrepBridge
import { getToken } from 'firebase/messaging'
import { getMessagingInstance } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { updateUserProfile } from '../firebase/auth'

/**
 * Requests browser permission for desktop push alerts, retrieves the Firebase
 * Cloud Messaging token using the configured VAPID key, and registers it to the user's Firestore profile.
 *
 * @param {string} uid - The authenticated user's ID
 * @returns {Promise<string>} - Resolves with the FCM registration token string
 */
export async function registerPushNotifications(uid) {
  if (!uid) {
    throw new Error('User must be logged in to subscribe to notifications.')
  }

  if (!('Notification' in window)) {
    throw new Error('This browser does not support desktop notifications.')
  }

  // Request browser prompt
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Permission denied. Please enable notifications in your browser settings.')
  }

  // Load VAPID public key configuration (with dynamic firestore priority and prefilled fallbacks)
  let vapidKey = 'KgbnAHVC-8kSUu1MsUSetejeLlL9i2oBbJ80qTTnt84' // default prefilled user key

  try {
    const docRef = doc(db, 'settings', 'integrations')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists() && docSnap.data().firebaseVapidKey) {
      vapidKey = docSnap.data().firebaseVapidKey
    } else {
      const local = localStorage.getItem('prepbridge_admin_settings')
      if (local) {
        const cached = JSON.parse(local).firebaseVapidKey
        if (cached) vapidKey = cached
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve live VAPID key, using prefilled default:', e)
    const local = localStorage.getItem('prepbridge_admin_settings')
    if (local) {
      try {
        const cached = JSON.parse(local).firebaseVapidKey
        if (cached) vapidKey = cached
      } catch (err) {
        console.error(err)
      }
    }
  }

  const messaging = await getMessagingInstance()
  if (!messaging) {
    throw new Error('Firebase messaging is not supported in this browser environment.')
  }

  console.log(`[Web Push] Requesting token with VAPID Key: ${vapidKey.substring(0, 10)}...`)

  // Retrieve token from FCM
  const token = await getToken(messaging, { vapidKey: vapidKey.trim() })

  if (token) {
    console.log('[Web Push] FCM registration token generated:', token)

    // Save token and subscription flags to the user profile
    await updateUserProfile(uid, {
      fcmToken: token,
      pushNotificationsEnabled: true,
      pushSubscriptionDate: new Date().toISOString()
    })

    return token
  } else {
    throw new Error('FCM token generation returned empty. Please check your Firebase configurations.')
  }
}
