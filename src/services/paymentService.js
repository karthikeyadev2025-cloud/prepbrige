// Razorpay Payment Integration Service — PrepBridge
// Handles loading checkout.js dynamically and managing client checkout transactions.
import { updateUserProfile } from '../firebase/auth'
import { toast } from 'react-hot-toast'

// ─── Pricing Constants (Single Source of Truth) ──────────────────────────────
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

// ─── Trial Constants ──────────────────────────────────────────────────────────
export const TRIAL_DAYS = 2 // 2-day free trial for all new users

// Build a fresh trial subscription object (call at onboarding completion)
export function createTrialSubscription() {
  const now = new Date()
  const trialEnd = new Date(now)
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS)
  return {
    plan: 'trial',
    startDate: now.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
  }
}

// Returns rich trial status for any component to consume
// Returns: { isTrial, isActive, isExpired, isPaid, hoursLeft, daysLeft, trialEndsAt }
export function getSubscriptionStatus(subscription) {
  if (!subscription) return { isTrial: false, isActive: false, isExpired: false, isPaid: false, hoursLeft: 0, daysLeft: 0 }

  const plan = subscription.plan

  if (plan === 'paid') {
    return { isTrial: false, isActive: true, isExpired: false, isPaid: true, hoursLeft: 0, daysLeft: 0 }
  }

  if (plan === 'trial') {
    const now = Date.now()
    const trialEnd = new Date(subscription.trialEndsAt).getTime()
    const msLeft = trialEnd - now
    const hoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)))
    const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)))
    const isActive = msLeft > 0

    return {
      isTrial: true,
      isActive,
      isExpired: !isActive,
      isPaid: false,
      hoursLeft,
      daysLeft,
      trialEndsAt: subscription.trialEndsAt,
      msLeft,
    }
  }

  // plan === 'free' or anything else
  return { isTrial: false, isActive: false, isExpired: false, isPaid: false, hoursLeft: 0, daysLeft: 0 }
}

// ─── Razorpay Helpers ─────────────────────────────────────────────────────────

// Dynamically load the Razorpay checkout.js script
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Open Razorpay checkout
// planType: 'monthly' | 'sixMonth'
export async function initiatePremiumCheckout(user, profile, updateProfile, onComplete, planType = 'monthly') {
  const plan = PRICING[planType] || PRICING.monthly

  const isLoaded = await loadRazorpayScript()
  if (!isLoaded) {
    toast.error('Failed to load Razorpay. Please check your internet connection.')
    return
  }

  const options = {
    key: 'rzp_test_prepbridgeKey123', // Replace with live key in production
    amount: plan.amountPaise,
    currency: 'INR',
    name: 'PrepBridge Premium',
    description: plan.description,
    image: '/icons/icon-192.png',
    handler: async function (response) {
      const paymentId = response.razorpay_payment_id
      toast.success(`Payment Successful! ${plan.label} activated 🎉`, { duration: 5000 })

      const now = new Date()
      const expiresAt = new Date(now)
      if (planType === 'sixMonth') expiresAt.setMonth(expiresAt.getMonth() + 6)
      else expiresAt.setMonth(expiresAt.getMonth() + 1)

      const premiumSubscription = {
        plan: 'paid',
        planType,
        planLabel: plan.label,
        amount: plan.amount,
        startDate: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        paymentId,
      }

      // 1. Sync to Firestore
      if (user?.uid) {
        try {
          await updateUserProfile(user.uid, {
            subscription: premiumSubscription,
            points: (profile?.points || 0) + 100,
          })
        } catch (e) { console.error('Firestore subscription sync failed:', e) }
      }

      // 2. Update Zustand store locally
      updateProfile({ subscription: premiumSubscription, points: (profile?.points || 0) + 100 })

      if (onComplete) onComplete()
    },
    prefill: { name: profile?.name || '', email: user?.email || '', contact: user?.phone || '' },
    theme: { color: '#7c3aed' },
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}
