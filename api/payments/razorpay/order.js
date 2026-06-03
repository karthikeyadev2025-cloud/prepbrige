// Razorpay Order Creation — Server-side only
// RAZORPAY_KEY_SECRET never exposed to browser

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

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET')
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  const { planType, userId } = req.body

  if (!planType || !userId) {
    return res.status(400).json({ error: 'Missing required parameters: planType, userId' })
  }

  // Server-side price validation — never trust client-sent amounts
  const PRICES = {
    monthly: 24900,
    sixMonth: 119500,
    annual: 199900,
  }

  const amountPaise = PRICES[planType]
  if (!amountPaise) {
    return res.status(400).json({ error: 'Invalid planType. Must be monthly, sixMonth, or annual.' })
  }

  const receipt = `pb_${userId.slice(0, 12)}_${Date.now()}`

  try {
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('[Razorpay] Order creation failed:', err)
      return res.status(502).json({ error: err.error?.description || 'Failed to create Razorpay order' })
    }

    const order = await response.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('[Razorpay] Order creation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
