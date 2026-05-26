// Razorpay Payment Integration Service — PrepBridge
// Handles loading checkout.js dynamically and managing client checkout transactions.
import { updateUserProfile } from '../firebase/auth'
import { toast } from 'react-hot-toast'

// Pricing constants — single source of truth
export const PRICING = {
  monthly: {
    label: 'Monthly Plan',
    amount: 249,           // ₹249/month
    amountPaise: 24900,    // in paise for Razorpay
    description: 'PrepBridge All-Access — Monthly Plan',
    badge: '₹249/mo',
    planDuration: '1 month',
  },
  sixMonth: {
    label: '6-Month Plan',
    amount: 1195,          // ₹249 × 6 × 0.8 = ₹1,195.20 → ₹1,195
    amountPaise: 119500,   // in paise for Razorpay
    description: 'PrepBridge All-Access — 6-Month Plan (20% OFF)',
    badge: '₹1,195 for 6 months',
    planDuration: '6 months',
    savings: Math.round(249 * 6 * 0.20), // ₹299 saved
    discountLabel: '20% OFF',
    perMonth: Math.round(1195 / 6),      // ≈ ₹199/mo effective
  }
}

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
// planType: 'monthly' | 'sixMonth'
export async function initiatePremiumCheckout(user, profile, updateProfile, onComplete, planType = 'monthly') {
  const plan = PRICING[planType] || PRICING.monthly

  const isLoaded = await loadRazorpayScript()
  if (!isLoaded) {
    toast.error('Failed to load Razorpay payment gateway. Please check your internet connection.')
    return
  }

  const options = {
    // Replace with your live Razorpay key in production
    key: 'rzp_test_prepbridgeKey123',
    amount: plan.amountPaise,
    currency: 'INR',
    name: 'PrepBridge Premium',
    description: plan.description,
    image: '/icons/icon-192.png',
    handler: async function (response) {
      const paymentId = response.razorpay_payment_id
      toast.success(`Payment Successful! Welcome to Premium! 🎉 ${plan.label} activated.`, { duration: 5000 })

      const now = new Date()
      const expiresAt = new Date(now)
      if (planType === 'sixMonth') {
        expiresAt.setMonth(expiresAt.getMonth() + 6)
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }

      const premiumSubscription = {
        plan: 'paid',
        planType: planType,
        planLabel: plan.label,
        amount: plan.amount,
        startDate: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
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
