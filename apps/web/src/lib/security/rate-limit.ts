/**
 * In-memory sliding-window rate limiter.
 *
 * Protects auth, payment, payout and scraper endpoints from brute-force and
 * abuse (SECURITY.md §6). This implementation is process-local and intended
 * for a single instance / development. In production behind multiple instances,
 * back it with a shared store (e.g. Upstash Redis) using the same interface.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Consume one token for `key` within a fixed window.
 * @param key      Unique identity (e.g. `auth:signin:<ip>`).
 * @param limit    Max attempts per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Opportunistically evict expired buckets to bound memory. */
export function sweepRateLimiter(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Common presets. */
export const RATE_LIMITS = {
  authSignIn: { limit: 5, windowMs: 5 * 60 * 1000 }, // 5 / 5 min
  authSignUp: { limit: 3, windowMs: 15 * 60 * 1000 }, // 3 / 15 min
  payment: { limit: 10, windowMs: 60 * 1000 },
  scraper: { limit: 10, windowMs: 60 * 1000 },
} as const;
