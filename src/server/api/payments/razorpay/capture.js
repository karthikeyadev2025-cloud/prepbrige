// API Route: POST /api/payments/razorpay/capture
// Captures a Razorpay payment and updates status in Supabase

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, amount } = req.body;

    // Validate input
    if (!paymentId || !amount) {
      return res.status(400).json({ error: 'Payment ID and amount required' });
    }

    // Capture payment via Razorpay
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const payment = await razorpay.payments.capture(paymentId, amount);

    // Update payment status in Supabase
    const { error: dbError } = await supabase
      .from('payments')
      .upsert({
        payment_id: paymentId,
        order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        captured_at: new Date().toISOString(),
        user_id: req.headers['x-user-id'] || null,
        receipt: payment.receipt,
        notes: payment.notes,
      }, {
        onConflict: 'payment_id',
      });

    if (dbError) {
      console.error('Failed to store payment:', dbError);
      return res.status(500).json({ error: 'Failed to capture payment' });
    }

    // Update order status
    await supabase
      .from('payment_orders')
      .update({ status: 'paid' })
      .eq('order_id', payment.order_id);

    res.status(200).json({
      success: true,
      paymentId,
      amount: payment.amount,
      status: payment.status,
    });

  } catch (error) {
    console.error('Razorpay capture error:', error);
    res.status(500).json({ error: error.message || 'Failed to capture payment' });
  }
}