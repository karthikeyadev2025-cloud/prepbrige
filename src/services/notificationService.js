// Firebase Web Push Notification Service — PrepBridge
import { getToken } from 'firebase/messaging'
import { getMessagingInstance } from '../firebase/config'
import { getSupabaseSettings } from './supabaseService'
import { updateUserProfile } from '../firebase/auth'

/**
 * Requests browser permission for desktop push alerts, retrieves the Firebase
 * Cloud Messaging token using the configured VAPID key, and registers it to the user's Supabase profile.
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

  // Load VAPID public key configuration (with dynamic Supabase priority and prefilled fallbacks)
  let vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'KgbnAHVC-8kSUu1MsUSetejeLlL9i2oBbJ80qTTnt84'

  try {
    const liveSettings = await getSupabaseSettings()
    if (liveSettings && liveSettings.firebaseVapidKey) {
      vapidKey = liveSettings.firebaseVapidKey
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


  // Retrieve token from FCM
  const token = await getToken(messaging, { vapidKey: vapidKey.trim() })

  if (token) {

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
