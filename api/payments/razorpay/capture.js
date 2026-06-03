// Razorpay Payment Verification & Enrollment — Server-side only
// Verifies HMAC-SHA256 signature, saves payment record, grants subscription

import crypto from 'crypto'
import { getSupabaseAdmin } from '../../_lib/env.js'

const PLAN_DETAILS = {
  monthly: { label: 'Monthly Plan', months: 1 },
  sixMonth: { label: '6-Month Plan', months: 6 },
  annual: { label: 'Annual Plan', months: 12 },
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, planType } = req.body

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId || !planType) {
    return res.status(400).json({ error: 'Missing required fields for payment verification' })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  try {
    // 1. Verify Razorpay signature (HMAC-SHA256)
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const expectedSignature = hmac.digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.warn(`[Razorpay] Signature mismatch for order ${razorpay_order_id}, user ${userId}`)
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' })
    }

    // 2. Server-side price lookup
    const PRICES = { monthly: 24900, sixMonth: 119500, annual: 199900 }
    const amountPaise = PRICES[planType]
    if (!amountPaise) {
      return res.status(400).json({ error: 'Invalid planType' })
    }

    const planInfo = PLAN_DETAILS[planType]
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + planInfo.months)

    const supabase = getSupabaseAdmin()

    // 3. Save verified payment record
    const { error: paymentError } = await supabase.from('payments').upsert({
      user_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amountPaise,
      currency: 'INR',
      plan_type: planType,
      plan_label: planInfo.label,
      status: 'captured',
      verified: true,
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'razorpay_order_id' })

    if (paymentError) {
      console.error('[Capture] Payment save failed:', paymentError)
      return res.status(500).json({ error: 'Failed to save payment record' })
    }

    // 4. Grant subscription in profiles table
    const { error: profileError } = await supabase.from('profiles').update({
      plan: 'paid',
      updated_at: now.toISOString(),
    }).eq('id', userId)

    if (profileError) {
      console.error('[Capture] Profile update failed:', profileError)
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('[Capture] Verification error:', error)
    return res.status(500).json({ error: 'Internal server error during verification' })
  }
}
