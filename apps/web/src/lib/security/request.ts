/**
 * Request-context security helpers (server-only).
 */
import { headers } from 'next/headers';

/**
 * Best-effort client IP for rate-limiting keys. Trusts the platform's proxy
 * headers (Vercel/Cloudflare set x-forwarded-for). Never use the IP for
 * authorization — only for abuse throttling.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? '0.0.0.0';
}

/** Strong password policy enforced server-side at sign-up. */
export function assertStrongPassword(password: string): string | null {
  if (password.length < 8) return 'Parola en az 8 karakter olmalı.';
  if (password.length > 72) return 'Parola en fazla 72 karakter olabilir.';
  if (!/[a-z]/.test(password)) return 'Parola en az bir küçük harf içermeli.';
  if (!/[A-Z]/.test(password)) return 'Parola en az bir büyük harf içermeli.';
  if (!/[0-9]/.test(password)) return 'Parola en az bir rakam içermeli.';
  return null;
}
