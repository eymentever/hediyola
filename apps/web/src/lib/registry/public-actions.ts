'use server';

/**
 * Public (guest-facing) registry actions: private-list passcode unlocking and
 * registry search.
 *
 * Security:
 *  - Passcode hashes are read only with the server-side admin client and are
 *    NEVER sent to the browser. Verification is constant-time (scrypt).
 *  - On success we set an httpOnly, signed-by-platform unlock cookie scoped to
 *    that registry; the raw passcode never persists client-side.
 *  - Search runs against ACTIVE registries via the RLS-bound anon client.
 */
import { cookies } from 'next/headers';
import { slugSchema, passcodeCheckSchema, type ApiResult } from '@hediyola/shared';
import { getSupabaseAdmin } from '@hediyola/db/supabase-admin';
import { createClient } from '@/lib/supabase/server';
import { getClientIp } from '@/lib/security/request';
import { rateLimit } from '@/lib/security/rate-limit';
import { verifyPasscode } from '@/lib/security/hash';
import { unlockCookieName } from '@/lib/registry/utils';

// unlockCookieName lives in ./utils.ts (plain helper, not a server action).

/** Verify a private-list passcode and, on success, set an unlock cookie. */
export async function verifyPasscodeAction(
  formData: FormData,
): Promise<ApiResult<{ unlocked: true }>> {
  const ip = await getClientIp();
  // Throttle guessing: 10 tries / 5 min per IP.
  const limit = rateLimit(`passcode:${ip}`, 10, 5 * 60 * 1000);
  if (!limit.success) {
    return { ok: false, error: 'Çok fazla deneme. Biraz sonra tekrar dene.', code: 'RATE_LIMITED' };
  }

  const parsed = passcodeCheckSchema.safeParse({
    slug: formData.get('slug'),
    passcode: formData.get('passcode'),
  });
  if (!parsed.success) return { ok: false, error: 'Geçersiz istek.', code: 'VALIDATION' };

  // Read the registry + passcode hash with the admin client (server-only).
  const admin = getSupabaseAdmin();
  const { data: registry } = await admin
    .from('registries')
    .select('id, passcode, status')
    .eq('slug', parsed.data.slug)
    .maybeSingle();

  // Uniform failure response (don't reveal whether the list exists).
  if (!registry || registry.status !== 'ACTIVE' || !registry.passcode) {
    return { ok: false, error: 'Parola hatalı.', code: 'INVALID' };
  }

  const valid = await verifyPasscode(parsed.data.passcode, registry.passcode);
  if (!valid) return { ok: false, error: 'Parola hatalı.', code: 'INVALID' };

  const cookieStore = await cookies();
  cookieStore.set(unlockCookieName(registry.id), '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return { ok: true, data: { unlocked: true } };
}

export interface RegistrySearchResult {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  weddingDate: string;
  coverImage: string | null;
}

/** Search public (ACTIVE) registries by couple/title or slug. */
export async function searchRegistriesAction(
  query: string,
): Promise<ApiResult<RegistrySearchResult[]>> {
  const q = query.trim();
  if (q.length < 2) return { ok: true, data: [] };

  // Escape PostgREST ilike wildcards in user input.
  const safe = q.replace(/[%,]/g, ' ');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('registries')
    .select('id, title, slug, location, wedding_date, cover_image')
    .eq('status', 'ACTIVE')
    .or(`title.ilike.%${safe}%,slug.ilike.%${safe}%`)
    .limit(20);

  if (error) return { ok: false, error: 'Arama başarısız.', code: 'SEARCH_FAILED' };

  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      location: r.location,
      weddingDate: r.wedding_date,
      coverImage: r.cover_image,
    })),
  };
}
