// Razorpay Webhook Handler — verifies signature and updates payment status

import crypto from 'crypto'
import { getSupabaseAdmin } from '../../_lib/env.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  const signature = req.headers['x-razorpay-signature']
  if (!signature) {
    return res.status(400).json({ error: 'Missing webhook signature' })
  }

  // Verify webhook signature
  const body = JSON.stringify(req.body)
  const expectedSig = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')

  if (expectedSig !== signature) {
    console.warn('[Webhook] Invalid signature')
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  const { event, payload } = req.body
  const supabase = getSupabaseAdmin()

  try {
    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity
      if (payment) {
        await supabase.from('payments')
          .update({ status: 'captured', updated_at: new Date().toISOString() })
          .eq('razorpay_payment_id', payment.id)
      }
    } else if (event === 'payment.failed') {
      const payment = payload?.payment?.entity
      if (payment) {
        await supabase.from('payments')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('razorpay_order_id', payment.order_id)
      }
    } else if (event === 'refund.created') {
      const refund = payload?.refund?.entity
      if (refund) {
        await supabase.from('payments')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('razorpay_payment_id', refund.payment_id)
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
