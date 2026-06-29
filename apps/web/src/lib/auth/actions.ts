'use server';

/**
 * Authentication & profile server actions.
 *
 * Security model (SECURITY.md):
 *  - Every input is parsed with a Zod schema from @hediyola/shared.
 *  - Brute-force protection via per-IP rate limiting.
 *  - Strong password policy enforced server-side.
 *  - The user's role is NEVER accepted from the client; it is set by the DB
 *    trigger (default COUPLE) and can only be elevated by an admin in the DB.
 *  - Sessions live in httpOnly cookies managed by Supabase SSR; tokens never
 *    touch JS-readable storage.
 */
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  signInSchema,
  signUpSchema,
  profileUpdateSchema,
  type ApiResult,
} from '@hediyola/shared';
import { createClient } from '@/lib/supabase/server';
import { getClientIp, assertStrongPassword } from '@/lib/security/request';
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

/** Sign up with email/password. Profile row is created by the auth trigger. */
export async function signUpAction(formData: FormData): Promise<ApiResult<{ pending: boolean }>> {
  const ip = await getClientIp();
  const limit = rateLimit(`auth:signup:${ip}`, RATE_LIMITS.authSignUp.limit, RATE_LIMITS.authSignUp.windowMs);
  if (!limit.success) {
    return { ok: false, error: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.', code: 'RATE_LIMITED' };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Geçersiz bilgiler. Lütfen alanları kontrol edin.', code: 'VALIDATION' };
  }

  const passwordError = assertStrongPassword(parsed.data.password);
  if (passwordError) {
    return { ok: false, error: passwordError, code: 'WEAK_PASSWORD' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // full_name is read by the handle_new_user() trigger; role is NOT settable.
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    // Generic message — do not leak whether the email already exists.
    return { ok: false, error: 'Kayıt tamamlanamadı. Bilgileri kontrol edip tekrar deneyin.', code: 'SIGNUP_FAILED' };
  }

  return { ok: true, data: { pending: true } };
}

/** Sign in with email/password. */
export async function signInAction(formData: FormData): Promise<ApiResult<{ ok: true }>> {
  const ip = await getClientIp();
  const limit = rateLimit(`auth:signin:${ip}`, RATE_LIMITS.authSignIn.limit, RATE_LIMITS.authSignIn.windowMs);
  if (!limit.success) {
    return { ok: false, error: 'Çok fazla başarısız deneme. Bir süre sonra tekrar deneyin.', code: 'RATE_LIMITED' };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, error: 'E-posta veya parola hatalı.', code: 'VALIDATION' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Uniform error — never reveal which field was wrong (prevents enumeration).
    return { ok: false, error: 'E-posta veya parola hatalı.', code: 'INVALID_CREDENTIALS' };
  }

  revalidatePath('/', 'layout');
  return { ok: true, data: { ok: true } };
}

/** Sign out and clear the session. */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/** Update the current user's own profile (full name only; role is protected). */
export async function updateProfileAction(formData: FormData): Promise<ApiResult<{ ok: true }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };
  }

  const parsed = profileUpdateSchema.safeParse({ fullName: formData.get('fullName') });
  if (!parsed.success || !parsed.data.fullName) {
    return { ok: false, error: 'Geçersiz isim.', code: 'VALIDATION' };
  }

  // RLS ensures a user can only update their OWN row (id = auth.uid()).
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('id', user.id);

  if (error) {
    return { ok: false, error: 'Profil güncellenemedi.', code: 'UPDATE_FAILED' };
  }

  revalidatePath('/dashboard/profile');
  return { ok: true, data: { ok: true } };
}
