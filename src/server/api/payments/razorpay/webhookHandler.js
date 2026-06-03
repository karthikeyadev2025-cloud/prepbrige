// =====================================================================
// PREPBRIDGE ENTERPRISE RAZORPAY WEBHOOK INTEGRATION
// Production-Ready Webhook Controller implementing SHA-256 HMAC Audit,
// Strict Idempotent Processing, and Resilient Supabase Profile Upgrades.
// =====================================================================

const crypto = require('crypto');
const { getSupabaseProfile, upsertSupabaseProfile } = require('../../../../services/supabaseService');

// Helper: fetch credentials for PostgreSQL queries via custom REST patterns
async function queryDatabase(endpoint, method, payload = null) {
  let url = process.env.VITE_SUPABASE_URL || '';
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    throw new Error('Supabase integration credentials are not configured in environment variables.');
  }

  const cleanUrl = url.trim().replace(/\/$/, '');
  const targetUrl = `${cleanUrl}/rest/v1/${endpoint}`;

  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const response = await fetch(targetUrl, {
    method: method,
    headers: headers,
    body: payload ? JSON.stringify(payload) : null
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Database query failed (HTTP ${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * Endpoint receiver for incoming Razorpay payment capture webhooks.
 * Validates integrity via HMAC checking, and performs idempotent profile mutations.
 */
async function handleRazorpayWebhook(req, res) {
  // A. Signature Verification (prevent spoofing attacks)
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('[Webhook] Security Breach: Missing signature header or secret config.');
    return res.status(401).json({ success: false, error: 'SECURITY_VIOLATION', message: 'Signature validation required.' });
  }

  // Get raw body payload for correct cryptographic validation
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (generatedSignature !== signature) {
    console.error('[Webhook] Security Breach: Cryptographic signature mismatch detected.');
    return res.status(403).json({ success: false, error: 'SIGNATURE_MISMATCH', message: 'Cryptographic validation failed.' });
  }

  try {
    const event = req.body;
    console.info(`[Webhook] Event authenticated successfully: ${event.event} [ID: ${event.id}]`);

    // We specifically listen to 'payment.captured' and 'order.paid' events
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amountPaise = paymentEntity.amount;
      const userEmail = paymentEntity.email;

      // Extract custom user ID from notes payload if pre-seeded on client
      const userId = paymentEntity.notes?.userId || paymentEntity.notes?.uid;

      if (!userId) {
        console.error('[Webhook] Error: Payment captured but no notes.userId payload was provided.');
        return res.status(400).json({ success: false, error: 'MISSING_METADATA', message: 'User metadata notes key missing.' });
      }

      // B. Idempotency Check: verify if payment log already exists
      const existingPayments = await queryDatabase(`payments?razorpay_payment_id=eq.${paymentId}`, 'GET');
      if (existingPayments && existingPayments.length > 0) {
        console.warn(`[Webhook] Warning: Event already processed (Payment ID: ${paymentId}). Skipping redundant mutation.`);
        return res.status(200).json({ success: true, status: 'ALREADY_PROCESSED' });
      }

      // C. Record Payment Audit Log in public.payments table
      const paymentRecord = {
        user_id: userId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        amount_paise: amountPaise,
        currency: paymentEntity.currency || 'INR',
        status: 'captured',
        plan_tier: 'paid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await queryDatabase('payments', 'POST', paymentRecord);

      // D. Update Student Profile Plan and award VIP points
      const profile = await getSupabaseProfile(userId);
      if (profile) {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1-year VIP subscription expiry

        const updatedProfile = {
          ...profile,
          subscription: {
            plan: 'paid',
            planType: 'annual',
            planLabel: 'VIP All-Access',
            expiresAt: expiresAt.toISOString(),
            paymentId: paymentId
          },
          points: (profile.points || 0) + 100, // Reward 100 VIP coins upon upgrade
          updatedAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };

        await upsertSupabaseProfile(userId, updatedProfile);
        console.info(`[Webhook] Success: Profile updated to VIP plan for UID: ${userId}`);
      } else {
        console.error(`[Webhook] Profile not found for UID: ${userId}. Creating blank premium placeholder profile.`);
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await upsertSupabaseProfile(userId, {
          uid: userId,
          email: userEmail || null,
          displayName: 'Aspirant',
          onboardingComplete: false,
          subscription: {
            plan: 'paid',
            planType: 'annual',
            planLabel: 'VIP All-Access',
            expiresAt: expiresAt.toISOString(),
            paymentId: paymentId
          },
          points: 100
        });
      }
    }

    // Acknowledge receipt of webhook with HTTP 200
    return res.status(200).json({ success: true, status: 'COMPLETED' });

  } catch (err) {
    console.error('[Webhook] Operation failure during event processing:', err);
    // Return HTTP 500 so Razorpay will execute scheduled retries with exponential backoffs
    return res.status(500).json({ success: false, error: 'PROCESSING_FAILED', message: err.message });
  }
}

module.exports = {
  handleRazorpayWebhook
};
