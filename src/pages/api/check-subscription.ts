// Next.js API Route: Check current user's subscription status
// - Accepts Authorization: Bearer <supabase_access_token> (or reads cookie)
// - Uses Supabase Auth to resolve user from token, then queries subscriptions table
// - Uses SUPABASE_SERVICE_ROLE_KEY server-side to query the subscriptions safely

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Server-side environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  // Prefer Authorization header, fallback to cookie named 'sb-access-token'
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.cookies['sb-access-token'] || '');
  if (!token) return res.status(401).json({ error: 'Missing access token' });

  // Create a Supabase client with anon key and pass the user's token in the header
  const clientForAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });

  // Get the user associated with the token
  try {
    const { data: { user }, error } = await clientForAuth.auth.getUser();
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    // Server-side: use service role key to query subscriptions table
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: subs, error: subsError } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (subsError) return res.status(500).json({ error: subsError.message });
    const subscription = subs && subs.length > 0 ? subs[0] : null;
    const status = subscription ? subscription.status : 'inactive';

    return res.status(200).json({ status, subscription });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
