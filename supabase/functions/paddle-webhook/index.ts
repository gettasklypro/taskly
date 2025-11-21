// Supabase Edge Function: Paddle Webhook Handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const PADDLE_WEBHOOK_SECRET = Deno.env.get("PADDLE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Helper: Verify Paddle webhook signature (HMAC-SHA256)
async function verifyPaddleSignature(body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = encoder.encode(PADDLE_WEBHOOK_SECRET);
  const data = encoder.encode(body);
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  return await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, data);
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") || "";

  if (!await verifyPaddleSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Idempotent upsert/update
  if (event.type === "subscription.created" || event.type === "subscription.updated") {
    const { subscription_id, customer_id, plan_id, status, next_bill_date, user_id } = event.data;
    await supabase.from("subscriptions").upsert([
      {
        paddle_subscription_id: subscription_id,
        paddle_customer_id: customer_id,
        plan_id,
        status,
        next_billing_at: next_bill_date,
        user_id
      }
    ], { onConflict: "paddle_subscription_id" });
  } else if (event.type === "subscription.cancelled") {
    const { subscription_id } = event.data;
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("paddle_subscription_id", subscription_id);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});