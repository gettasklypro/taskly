import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware: protect premium routes by checking subscription status via server API
// - For any route under /app/premium(or customize) this middleware will verify the user's subscription
// - It expects the Supabase session token in cookie 'sb-access-token' or 'sb-refresh-token'

const PREMIUM_PATHS = ['/dashboard/premium', '/app/premium'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // Only enforce on premium paths
  if (!PREMIUM_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get('sb-access-token')?.value || '';
  if (!token) {
    // Not logged in -> redirect to pricing or login
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    return NextResponse.redirect(url);
  }

  // Call our server-side API to check subscription status
  const origin = req.nextUrl.origin;
  try {
    const resp = await fetch(`${origin}/api/check-subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
      const url = req.nextUrl.clone();
      url.pathname = '/pricing';
      return NextResponse.redirect(url);
    }
    const data = await resp.json();
    if (data.status !== 'active') {
      const url = req.nextUrl.clone();
      url.pathname = '/pricing';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch (err) {
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/dashboard/premium/:path*', '/app/premium/:path*'],
};
