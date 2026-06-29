/**
 * OAuth / email-confirmation callback.
 *
 * Exchanges the `code` from Supabase for a session, then redirects. The
 * redirect target is validated to be a same-origin relative path to prevent
 * open-redirect attacks (SECURITY.md).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';

  // Only allow internal relative paths (must start with a single "/").
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // On failure, send the user to login with a generic notice.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
