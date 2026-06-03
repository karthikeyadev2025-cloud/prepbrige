// API Route: POST /api/payments/razorpay/order
// Creates a new Razorpay order server-side

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
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate input
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount (minimum ₹1)' });
    }

    // Generate idempotency key
    const idempotencyKey = req.headers['x-idempotency-key'] || Date.now().toString();

    // Create Razorpay order
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: 1, // Auto-capture
      notes: {
        platform: 'prepbridge',
        idempotencyKey,
      },
    });

    // Store order in Supabase
    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert([{
        order_id: order.id,
        amount,
        currency,
        receipt,
        status: 'created',
        idempotency_key: idempotencyKey,
        user_id: req.headers['x-user-id'] || null,
        created_at: new Date().toISOString(),
      }]);

    if (dbError) {
      console.error('Failed to store order:', dbError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    res.status(200).json({ orderId: order.id });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}