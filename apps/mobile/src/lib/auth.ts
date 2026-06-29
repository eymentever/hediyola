/**
 * Mobile auth helpers. Validation reuses the SAME Zod schemas as the web app
 * (@hediyola/shared) so rules can never drift between platforms.
 */
import { signInSchema, signUpSchema } from '@hediyola/shared';
import { supabase } from './supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false, error: 'E-posta veya parola hatalı.' };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Uniform error to prevent account enumeration.
  if (error) return { ok: false, error: 'E-posta veya parola hatalı.' };
  return { ok: true };
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({ fullName, email, password });
  if (!parsed.success) return { ok: false, error: 'Lütfen bilgileri kontrol edin.' };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { ok: false, error: 'Kayıt tamamlanamadı. Tekrar deneyin.' };
  return { ok: true };
}
