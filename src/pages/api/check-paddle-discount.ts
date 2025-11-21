import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid code' });
  }

  // Paddle Billing API endpoint for discounts (replace with your vendor ID and API key)
  const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
  const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID;
  if (!PADDLE_API_KEY || !PADDLE_VENDOR_ID) {
    return res.status(500).json({ error: 'Paddle API credentials not set' });
  }

  // Example: Paddle Billing API for discounts (update endpoint as needed)
  const endpoint = `https://api.paddle.com/vendors/${PADDLE_VENDOR_ID}/discounts?code=${encodeURIComponent(code)}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch Paddle discount' });
    }
    const data = await response.json();
    // Return discount details (adjust shape as needed)
    return res.status(200).json({ discount: data });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching Paddle discount', details: String(err) });
  }
}
