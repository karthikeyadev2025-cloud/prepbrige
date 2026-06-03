// Razorpay Payment Integration Service — PrepBridge
// Handles loading checkout.js dynamically and managing client checkout transactions.
import { updateUserProfile } from '../firebase/auth'
import { toast } from 'react-hot-toast'

// ─── Pricing Constants (Single Source of Truth) ──────────────────────────────
export const PRICING = {
  monthly: {
    label: 'Monthly Plan',
    amount: 249,           // ₹249/month
    amountPaise: 24900,
    description: 'PrepBridge All-Access — Monthly Plan',
    badge: '₹249/mo',
    planDuration: '1 month',
    tag: null,
    perMonth: '249',
    savings: 0,
  },
  sixMonth: {
    label: '6-Month Plan',
    amount: 1195,          // ₹249 × 6 × 0.8 = ₹1,195 (20% off)
    amountPaise: 119500,
    description: 'PrepBridge All-Access — 6-Month Plan (20% OFF)',
    badge: '₹1,195 (20% OFF)',
    planDuration: '6 months',
    tag: 'popular',
    perMonth: '199',
    savings: 299,
  },
  annual: {
    label: 'Annual Plan',
    amount: 1999,          // ₹249 × 12 × 0.74 ≈ ₹1,999 (33% off)
    amountPaise: 199900,
    description: 'PrepBridge All-Access — Annual Plan (33% OFF)',
    badge: '₹1,999 (33% OFF)',
    planDuration: '1 year',
    tag: 'best',
    perMonth: '167',
    savings: 989,
  },
}

// ─── Server API Endpoints ───────────────────────────────────────────────────
export const RAZORPAY_API = {
  ORDER: '/api/payments/razorpay/order',
  CAPTURE: '/api/payments/razorpay/capture',
  WEBHOOK: '/api/payments/razorpay/webhook',
}

// ─── Server-Side Razorpay Helpers (to be implemented on backend) ─────────────
/**
 * Create Razorpay Order (Server-side)
 * @param {number} amount - Amount in paise
 * @param {string} currency - Currency code (e.g. 'INR')
 * @param {string} receipt - Unique receipt ID
 * @returns {Promise<{ orderId: string, amount: number, currency: string }>}
 */
export async function createRazorpayOrder(amount, currency = 'INR', receipt) {
  const response = await fetch(RAZORPAY_API.ORDER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create Razorpay order');
  }

  return response.json();
}

/**
 * Capture Razorpay Payment (Server-side)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to capture in paise
 * @returns {Promise<{ success: boolean, paymentId: string, amount: number }>}
 */
export async function captureRazorpayPayment(paymentId, amount) {
  const response = await fetch(RAZORPAY_API.CAPTURE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to capture payment');
  }

  return response.json();
}

/**
 * Verify Razorpay Webhook — SERVER-SIDE ONLY
 * This function must only be called from Node.js backend (src/server/).
 * Do NOT call this from the browser/frontend — it relies on Node crypto.
 * @returns {boolean} Always returns false in browser context for safety.
 */
export function verifyRazorpayWebhook(_payload, _signature, _secret) {
  // NOTE: Actual verification happens in src/server/api/payments/razorpay/webhook.js
  // on the server side using Node's built-in crypto module.
  console.warn('[paymentService] verifyRazorpayWebhook should only be called server-side.')
  return false
}

// ─── Subscription Status Helpers ─────────────────────────────────────────────
/**
 * Returns a rich subscription status object from a subscription record.
 * @param {object|null} subscription - The subscription object from the user profile
 * @returns {{ isPaid: boolean, isTrial: boolean, isActive: boolean, isExpired: boolean, daysLeft: number, hoursLeft: number, trialEndsAt: string|null }}
 */
export function getSubscriptionStatus(subscription) {
  if (!subscription) {
    return { isPaid: false, isTrial: false, isActive: false, isExpired: false, daysLeft: 0, hoursLeft: 0, trialEndsAt: null }
  }

  const now = new Date()
  const isPaid = subscription.plan === 'paid'
  const isTrial = subscription.plan === 'trial'

  if (!isPaid && !isTrial) {
    return { isPaid: false, isTrial: false, isActive: false, isExpired: false, daysLeft: 0, hoursLeft: 0, trialEndsAt: null }
  }

  const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null
  const isExpired = expiresAt ? expiresAt < now : false
  const isActive = !isExpired

  const msLeft = expiresAt ? Math.max(0, expiresAt - now) : 0
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60))

  return {
    isPaid,
    isTrial,
    isActive,
    isExpired,
    daysLeft,
    hoursLeft,
    trialEndsAt: expiresAt ? expiresAt.toISOString() : null
  }
}

export function getSubscriptionBadge(subscription) {
  const status = getSubscriptionStatus(subscription)
  if (status.isPaid && status.isActive) return '🟢 Active'
  if (status.isPaid && status.isExpired) return '❌ Expired'
  if (status.isTrial && status.isActive) return '🌟 Trial'
  if (status.isTrial && status.isExpired) return '⏰ Trial Ended'
  return '🔓 Free'
}

// ─── Trial Subscription Creation ───────────────────────────────────────────────
export async function createTrialSubscription(user, updateProfile) {
  if (!user?.uid) return false

  const trialSubscription = {
    plan: 'trial',
    planType: 'trial',
    planLabel: '7-Day Free Trial',
    amount: 0,
    startDate: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    paymentId: 'trial',
  }

  try {
    await updateUserProfile(user.uid, {
      subscription: trialSubscription,
      points: 50,
    })
    updateProfile({ subscription: trialSubscription, points: 50 })
    return true
  } catch (error) {
    console.error('Failed to create trial subscription:', error)
    return false
  }
}

// ─── Razorpay SDK Loading ───────────────────────────────────────────────────
export async function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

// ─── Main Checkout Function (Updated to Use Server API) ─────────────────────
export async function initiatePremiumCheckout(user, profile, updateProfile, onComplete, planType = 'monthly') {
  const plan = PRICING[planType];
  if (!plan) {
    toast.error('Invalid plan selected');
    return false;
  }

  // 1. Create Razorpay order via our backend (amount validated server-side)
  try {
    const orderRes = await fetch(RAZORPAY_API.ORDER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planType,
        userId: user?.uid || '',
      }),
    });

    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      throw new Error(errorData.error || 'Failed to create payment order');
    }

    const { orderId } = await orderRes.json();

    // 2. Load Razorpay SDK if not already loaded
    const razorpayLoaded = await loadRazorpaySDK();
    if (!razorpayLoaded) {
      toast.error('Failed to load Razorpay. Please check your internet connection.');
      return false;
    }

    // 3. Open Razorpay Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_prepbridgeKey123',
      amount: plan.amountPaise,
      currency: 'INR',
      name: 'PrepBridge Premium',
      description: plan.description,
      image: '/icons/icon-192.png',
      order_id: orderId,
      handler: async function (response) {
        const paymentId = response.razorpay_payment_id;
        const signature = response.razorpay_signature;

        // 4. Verify payment and grant subscription server-side (required before granting access)
        try {
          const verifyRes = await fetch(RAZORPAY_API.CAPTURE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: signature,
              userId: user?.uid || '',
              planType,
            }),
          });

          if (!verifyRes.ok) {
            const errorData = await verifyRes.json();
            toast.error('Payment received but verification failed. Contact support with your payment ID: ' + paymentId);
            return;
          }

          const verifyData = await verifyRes.json();
          const serverExpiresAt = verifyData.expiresAt;

          // 5. Update local state only after server confirms
          const now = new Date();
          const expiresAt = serverExpiresAt ? new Date(serverExpiresAt) : (() => {
            const d = new Date(now);
            if (planType === 'annual') d.setFullYear(d.getFullYear() + 1);
            else if (planType === 'sixMonth') d.setMonth(d.getMonth() + 6);
            else d.setMonth(d.getMonth() + 1);
            return d;
          })();

          const premiumSubscription = {
            plan: 'paid',
            planType,
            planLabel: plan.label,
            amount: plan.amount,
            startDate: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            paymentId,
          };

          // Sync to Supabase profile via firebase auth service
          if (user?.uid) {
            try {
              await updateUserProfile(user.uid, {
                subscription: premiumSubscription,
                points: (profile?.points || 0) + 100,
              });
            } catch (e) {
              console.error('Profile subscription sync failed:', e);
            }
          }

          // Update Zustand store
          updateProfile({ subscription: premiumSubscription, points: (profile?.points || 0) + 100 });
          toast.success(`Payment verified! ${plan.label} is now active.`, { duration: 6000 });
          if (onComplete) onComplete();

        } catch (verifyError) {
          console.error('Payment verification error:', verifyError);
          toast.error('Payment received but could not be verified. Please contact support.');
        }
      },
      prefill: { name: profile?.name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#7c3aed' },
      modal: {
        ondismiss: () => {
          toast.warning('Payment cancelled. You can try again anytime.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    return true;
  } catch (error) {
    console.error('Razorpay checkout error:', error);
    toast.error(error.message || 'Payment initialization failed. Please try again.');
    return false;
  }
}