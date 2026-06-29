/**
 * Public (anon) Supabase client factory.
 *
 * Safe to use on the client: only ever carries the anon key, which is bound by
 * Row Level Security. For privileged server operations use `supabase-admin`.
 *
 * Reads env in a runtime-agnostic way so the same code works in Next.js
 * (NEXT_PUBLIC_*) and Expo (EXPO_PUBLIC_*).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = (globalThis as Record<string, unknown>).process
      ? (process.env as Record<string, string | undefined>)[key]
      : undefined;
    if (value) return value;
  }
  return undefined;
}

export function getSupabaseEnv() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_URL');
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        '(web) or EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile).',
    );
  }
  return { url, anonKey };
}

/**
 * Create an anon Supabase client. Pass platform-specific auth options
 * (e.g. expo-secure-store storage adapter on mobile).
 */
export function createSupabaseClient(
  options?: Parameters<typeof createClient>[2],
): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, options);
}

export type { SupabaseClient };
