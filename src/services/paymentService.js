// Razorpay Payment Integration Service — PrepBridge
// Handles loading checkout.js dynamically and managing client checkout transactions.
import { updateUserProfile } from '../firebase/auth'
import { toast } from 'react-hot-toast'

// Helper to dynamically load the Razorpay script
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Avoid appending script duplicate times
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Helper to initiate the premium checkout popup
export async function initiatePremiumCheckout(user, profile, updateProfile, onComplete) {
  const isLoaded = await loadRazorpayScript()
  if (!isLoaded) {
    toast.error('Failed to load Razorpay payment gateway. Please check your internet connection.')
    return
  }

  const options = {
    // Standard test key for simulation
    key: 'rzp_test_prepbridgeKey123',
    amount: 59900, // ₹599.00 in paise
    currency: 'INR',
    name: 'PrepBridge Premium',
    description: 'All India Exam Prep — Premium All-Access Plan',
    image: '/icons/icon-192.png',
    handler: async function (response) {
      const paymentId = response.razorpay_payment_id
      toast.success('Payment Successful! Welcome to Premium! 🎉', { duration: 5000 })
      
      const premiumSubscription = {
        plan: 'paid',
        startDate: new Date().toISOString(),
        paymentId: paymentId
      }

      // 1. Update Firestore Database
      if (user?.uid) {
        try {
          await updateUserProfile(user.uid, {
            subscription: premiumSubscription,
            points: (profile?.points || 0) + 100 // Reward 100 points for upgrading!
          })
        } catch (e) {
          console.error('Firestore subscription sync failed:', e)
        }
      }

      // 2. Update Zustand store locally
      updateProfile({
        subscription: premiumSubscription,
        points: (profile?.points || 0) + 100
      })

      if (onComplete) onComplete()
    },
    prefill: {
      name: profile?.name || '',
      email: user?.email || '',
      contact: user?.phone || ''
    },
    theme: {
      color: '#7c3aed' // Matching premium purple accent
    }
  }

  const razorpayInstance = new window.Razorpay(options)
  razorpayInstance.open()
}
