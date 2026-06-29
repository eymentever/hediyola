/**
 * Proxy — replaces Next.js middleware (deprecated in Next.js 15.3+).
 * Refreshes the Supabase auth session on every request so Server Components
 * always see a valid session, and centralizes route protection.
 *
 * Security: keeps tokens in httpOnly cookies (never localStorage) and lets RLS
 * remain the source of truth for data access.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars not set (e.g. during local dev without .env), skip auth check.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session to trigger token refresh when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect authenticated areas (dashboards). Public routes pass through.
  const protectedPrefixes = ['/dashboard', '/admin', '/onboarding'];
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except static assets, image optimisation, and API routes.
  // API routes handle their own auth via server-side guards.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
