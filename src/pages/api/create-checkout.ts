// Next.js API Route: Create Paddle Checkout Session
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { plan_id, user_id } = req.body;
  const PADDLE_API_KEY = process.env.PADDLE_API_KEY!;
  const response = await fetch("https://api.paddle.com/v2/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PADDLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      plan_id,
      customer: { id: user_id }
    })
  });

  const data = await response.json();
  // Example Paddle response: { checkout: { url: "https://checkout.paddle.com/session/abc123" } }
  if (!data.checkout?.url) return res.status(500).json({ error: "Failed to create checkout" });
  res.status(200).json({ url: data.checkout.url });
}
