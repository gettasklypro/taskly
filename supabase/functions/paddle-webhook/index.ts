// Supabase Edge Function: Paddle Webhook Handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

declare const Deno: any;
const PADDLE_WEBHOOK_SECRET = Deno.env.get("PADDLE_WEBHOOK_SECRET");
const PADDLE_PUBLIC_KEY = Deno.env.get("PADDLE_PUBLIC_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Convert PEM public key to ArrayBuffer
function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, '').replace(/-----END PUBLIC KEY-----/, '').replace(/\s+/g, '');
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Minimal PHP serialize implementation (strings, numbers, arrays, objects)
function phpSerialize(obj: any): string {
  if (obj === null || obj === undefined) return 'N;';
  if (typeof obj === 'string') {
    return `s:${new TextEncoder().encode(obj).length}:"${obj}";`;
  }
  if (typeof obj === 'number') {
    if (Number.isInteger(obj)) return `i:${obj};`;
    return `d:${obj};`;
  }
  if (Array.isArray(obj)) {
    let out = `a:${obj.length}:{`;
    for (let i = 0; i < obj.length; i++) {
      out += phpSerialize(i) + phpSerialize(obj[i]);
    }
    out += '}';
    return out;
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    let out = `a:${keys.length}:{`;
    for (const k of keys) {
      out += phpSerialize(k) + phpSerialize(obj[k]);
    }
    out += '}';
    return out;
  }
  return 'N;';
}

// Verify legacy p_signature (RSA) using PADDLE_PUBLIC_KEY
async function verifyPaddlePSignature(params: Record<string, any>, pSignature: string): Promise<boolean> {
  if (!PADDLE_PUBLIC_KEY) return false;
  try {
    const serialized = phpSerialize(params);
    const pubKeyBuf = pemToArrayBuffer(PADDLE_PUBLIC_KEY);
    // Try SHA-1 as commonly used historically
    const key = await crypto.subtle.importKey('spki', pubKeyBuf, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-1' }, false, ['verify']);
    const sig = Uint8Array.from(atob(pSignature), c => c.charCodeAt(0));
    const verified = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, new TextEncoder().encode(serialized));
    return verified;
  } catch (err) {
    console.error('p_signature verification error', err);
    return false;
  }
}

// Verify JSON HMAC (new Paddle Billing) using PADDLE_WEBHOOK_SECRET
async function verifyJsonHmac(rawBody: string, signatureHeader?: string) {
  if (!PADDLE_WEBHOOK_SECRET || !signatureHeader) return false;

  try {
    // Parse ts and h1 from the header
    // Header format: ts=1671234567;h1=abcdef123456...
    const parts = signatureHeader.split(';');
    let ts = '';
    let h1 = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'h1') h1 = value;
    }

    if (!ts || !h1) {
      console.warn('Missing ts or h1 in signature header');
      return false;
    }

    // Prevent replay attacks (optional, but good practice - allowing 5 mins drift)
    // const timestamp = parseInt(ts);
    // if (isNaN(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

    const signedPayload = `${ts}:${rawBody}`;

    const key = new TextEncoder().encode(PADDLE_WEBHOOK_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify', 'sign']
    );

    const sigBytesHex = new Uint8Array(h1.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const valid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      sigBytesHex,
      new TextEncoder().encode(signedPayload)
    );

    return valid;
  } catch (err) {
    console.error('HMAC verification error', err);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const rawBody = await req.text();
  const contentType = req.headers.get('content-type') || '';
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // 1) JSON HMAC (new Paddle Billing)
  if (contentType.includes('application/json')) {
    const sigHeader = req.headers.get('paddle-signature') || req.headers.get('Paddle-Signature') || req.headers.get('x-paddle-signature') || '';
    const ok = await verifyJsonHmac(rawBody, sigHeader);
    if (!ok) {
      console.warn('JSON HMAC verification failed');
      return new Response('Invalid signature', { status: 401 });
    }
    let event: any;
    try { event = JSON.parse(rawBody); } catch (err) { return new Response('Bad JSON', { status: 400 }); }

    const alert = event.alert_name || event.type || event.event || '';
    const data = event.data || event;

    if (alert && alert.toString().toLowerCase().includes('subscription')) {
      const subscription_id = data.subscription_id || data.subscriptionId || data.id;
      const customer_id = data.customer_id || data.customerId || data.user_id || data.userId;
      const plan_id = data.plan_id || data.planId || data.product_id;
      const status = data.status || data.state || 'active';
      const next_bill_date = data.next_bill_date || data.nextBillingAt || null;
      await supabase.from('subscriptions').upsert([
        {
          paddle_subscription_id: subscription_id,
          paddle_customer_id: customer_id,
          plan_id,
          status,
          next_billing_at: next_bill_date
        }
      ], { onConflict: 'paddle_subscription_id' });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // 2) Legacy form POST with p_signature
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const params = new URLSearchParams(rawBody);
    const p_signature = params.get('p_signature');
    if (!p_signature) return new Response('Missing p_signature', { status: 401 });

    const obj: Record<string, any> = {};
    for (const [k, v] of params.entries()) {
      if (k === 'p_signature') continue;
      let parsed: any = v;
      try { parsed = JSON.parse(v); } catch (_) { parsed = v; }
      obj[k] = parsed;
    }

    const verified = await verifyPaddlePSignature(obj, p_signature);
    if (!verified) {
      console.warn('p_signature verification failed');
      return new Response('Invalid p_signature', { status: 401 });
    }

    const alert = obj.alert_name || obj.alert || '';
    if (alert && alert.toString().toLowerCase().includes('subscription')) {
      const subscription_id = obj.subscription_id || obj.subscriptionId || obj.subscription;
      const status = obj.status || obj.state || (alert === 'subscription.canceled' || alert === 'subscription.cancelled' ? 'cancelled' : 'active');
      const plan_id = obj.plan_id || obj.planId || obj.product_id;
      const customer_id = obj.user_id || obj.customer_id || obj.user;
      const next_bill_date = obj.next_bill_date || null;
      await supabase.from('subscriptions').upsert([
        {
          paddle_subscription_id: subscription_id,
          paddle_customer_id: customer_id,
          plan_id,
          status,
          next_billing_at: next_bill_date
        }
      ], { onConflict: 'paddle_subscription_id' });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  return new Response('Unsupported content type', { status: 415 });
});