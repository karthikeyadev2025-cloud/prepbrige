import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required Razorpay signature parameters' });
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    // Create the expected signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    // Compare signatures
    if (expectedSignature === razorpay_signature) {
      // Signature is valid
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Razorpay Capture Verification Error:', error);
    res.status(500).json({ error: 'Internal Server Error during verification' });
  }
}
