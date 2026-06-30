/**
 * Server Supabase client (anon key + user session via cookies, RLS-bound).
 * Use inside Server Components, Route Handlers, and Server Actions.
 *
 * For privileged operations that must bypass RLS (verified webhooks, admin
 * jobs), use `getSupabaseAdmin()` from `@hediyola/db` instead — never here.
 *
 * When NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set
 * (local dev without .env) we return a safe no-op client so pages can still
 * render without crashing.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll called from a Server Component — safe to ignore when
          // proxy/middleware is responsible for refreshing the session.
        }
      },
    },
  });
}

/** Returns true when Supabase is actually configured (not just placeholders). */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
