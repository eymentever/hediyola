/**
 * Server-side authorization guards.
 *
 * Authorization is ALWAYS derived from the database (profiles.role), never from
 * client input or JWT claims that the client could influence. See SECURITY.md §3.
 *
 * When Supabase is not configured (local dev without .env) all guards return
 * null / throw gracefully so pages can render without crashing.
 */
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export interface AuthedUser {
  id: string;
  email: string | null;
  role: 'COUPLE' | 'ADMIN';
}

/** Return the current user + DB role, or null if not signed in. */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  // If Supabase is not configured, no one can be logged in.
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? null,
      role: (profile?.role as AuthedUser['role']) ?? 'COUPLE',
    };
  } catch {
    // Network/config error — treat as unauthenticated.
    return null;
  }
}

/** Throw-style guard for admin-only server actions/pages. */
export async function requireAdmin(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return user;
}

/** Guard requiring any authenticated user. */
export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
