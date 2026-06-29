/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * ⚠️  This client uses the service-role key and BYPASSES Row Level Security.
 * It must never be imported into client or mobile bundles. Use it strictly
 * inside trusted server code (verified webhooks, admin actions, server jobs).
 * See SECURITY.md §2.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  // Guard against accidental bundling into the browser.
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must never run in the browser.');
  }

  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
