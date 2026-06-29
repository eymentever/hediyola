'use server';

/**
 * Registry server actions — onboarding & customization.
 *
 * Security:
 *  - Inputs validated with Zod schemas from @hediyola/shared.
 *  - coupleId is ALWAYS taken from the authenticated session, never the client,
 *    so a user can only create registries they own (RLS double-enforces this).
 *  - Private-list passcodes are hashed with scrypt (never stored in plaintext).
 *  - Slug uniqueness is checked authoritatively (admin read) and ultimately
 *    guaranteed by the DB unique constraint.
 */
import { revalidatePath } from 'next/cache';
import {
  registryOnboardingSchema,
  registryCustomizeSchema,
  slugSchema,
  type ApiResult,
} from '@hediyola/shared';
import { getSupabaseAdmin } from '@hediyola/db/supabase-admin';
import { createClient } from '@/lib/supabase/server';
import { hashPasscode } from '@/lib/security/hash';

/** Reserved slugs that would clash with app routes. */
const RESERVED_SLUGS = new Set([
  'login', 'signup', 'dashboard', 'admin', 'onboarding', 'api', 'auth', 'list', 'search',
]);

/** Authoritative slug availability check (server-only). */
export async function checkSlugAvailability(rawSlug: string): Promise<ApiResult<{ available: boolean }>> {
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) return { ok: false, error: 'Geçersiz bağlantı adı.', code: 'VALIDATION' };
  if (RESERVED_SLUGS.has(parsed.data)) return { ok: true, data: { available: false } };

  // Admin read bypasses RLS so we can see slugs owned by other couples too.
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('registries')
    .select('id')
    .eq('slug', parsed.data)
    .maybeSingle();

  if (error) return { ok: false, error: 'Kontrol edilemedi.', code: 'CHECK_FAILED' };
  return { ok: true, data: { available: !data } };
}

/** Create a registry from the onboarding wizard. Returns the new registry id. */
export async function createRegistryAction(
  formData: FormData,
): Promise<ApiResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };

  const isPrivate = formData.get('isPrivate') === 'true' || formData.get('isPrivate') === 'on';
  const parsed = registryOnboardingSchema.safeParse({
    title: formData.get('title'),
    weddingDate: formData.get('weddingDate'),
    location: formData.get('location') || undefined,
    slug: formData.get('slug'),
    isPrivate,
    passcode: formData.get('passcode') || undefined,
    deliveryAddress: formData.get('deliveryAddress') || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: 'Lütfen alanları kontrol edin.', code: 'VALIDATION' };
  }

  // Cross-field rule: a private list MUST have a passcode.
  if (parsed.data.isPrivate && !parsed.data.passcode) {
    return { ok: false, error: 'Özel liste için bir parola belirleyin.', code: 'PASSCODE_REQUIRED' };
  }

  if (RESERVED_SLUGS.has(parsed.data.slug)) {
    return { ok: false, error: 'Bu bağlantı adı kullanılamaz.', code: 'SLUG_RESERVED' };
  }

  const passcodeHash = parsed.data.passcode ? await hashPasscode(parsed.data.passcode) : null;

  // Insert via the user's RLS-bound client; couple_id must equal auth.uid().
  const { data, error } = await supabase
    .from('registries')
    .insert({
      couple_id: user.id,
      title: parsed.data.title,
      wedding_date: parsed.data.weddingDate.toISOString(),
      location: parsed.data.location ?? null,
      slug: parsed.data.slug,
      passcode: passcodeHash,
      delivery_address: parsed.data.deliveryAddress ?? null,
      status: 'ACTIVE',
    })
    .select('id')
    .single();

  if (error) {
    // 23505 = unique_violation (slug already taken).
    if (error.code === '23505') {
      return { ok: false, error: 'Bu bağlantı adı zaten alınmış.', code: 'SLUG_TAKEN' };
    }
    return { ok: false, error: 'Liste oluşturulamadı.', code: 'CREATE_FAILED' };
  }

  revalidatePath('/dashboard');
  return { ok: true, data: { id: data.id } };
}

/** Update story / images / location from the customizer. */
export async function updateCustomizationAction(
  registryId: string,
  formData: FormData,
): Promise<ApiResult<{ ok: true }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };

  const parsed = registryCustomizeSchema.safeParse({
    story: formData.get('story') || undefined,
    coverImage: formData.get('coverImage') || undefined,
    avatarImage: formData.get('avatarImage') || undefined,
    location: formData.get('location') || undefined,
  });
  if (!parsed.success) return { ok: false, error: 'Geçersiz bilgiler.', code: 'VALIDATION' };

  // RLS ensures the update only applies to a registry the caller owns.
  const { error } = await supabase
    .from('registries')
    .update({
      story: parsed.data.story ?? null,
      cover_image: parsed.data.coverImage ?? null,
      avatar_image: parsed.data.avatarImage ?? null,
      location: parsed.data.location ?? null,
    })
    .eq('id', registryId)
    .eq('couple_id', user.id);

  if (error) return { ok: false, error: 'Güncellenemedi.', code: 'UPDATE_FAILED' };

  revalidatePath(`/dashboard/registry/${registryId}/customize`);
  return { ok: true, data: { ok: true } };
}
