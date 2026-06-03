// API Route: POST /api/payments/razorpay/webhook
// Handles Razorpay webhooks and verifies signature

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookPayload = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different webhook events
    const { event, payload } = webhookPayload;

    switch (event) {
      case 'payment.captured':
        // Payment was successfully captured
        await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        // Payment failed
        await handlePaymentFailed(payload);
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
}

async function handlePaymentCaptured(payload) {
  const payment = payload.payment;

  // Update payment status in Supabase
  const { error } = await supabase
    .from('payments')
    .update({
      status: payment.status,
      captured_at: payment.created_at,
      razorpay_payload: payment,
    })
    .eq('payment_id', payment.id);

  if (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }

  // Update order status
  await supabase
    .from('payment_orders')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', payment.order_id);
}

async function handlePaymentFailed(payload) {
  const payment = payload.payment;

  // Update payment status in Supabase
  const { error } = await supabase
    .from('payments')
    .update({
      status: payment.status,
      failure_reason: payment.error?.description || 'Payment failed',
      razorpay_payload: payment,
    })
    .eq('payment_id', payment.id);

  if (error) {
    console.error('Failed to update failed payment:', error);
    throw error;
  }

  // Update order status
  await supabase
    .from('payment_orders')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', payment.order_id);
}