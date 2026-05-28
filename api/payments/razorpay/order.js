import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, currency, receipt } = req.body;

  if (!amount || !receipt) {
    return res.status(400).json({ error: 'Missing required parameters: amount, receipt' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: currency || 'INR',
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
