# Security Architecture — Hediyola

Security is a **non-negotiable, maximum-priority** requirement for this platform because it
handles personal data, wedding logistics, and real money (gift purchases, cash-fund payouts,
IBAN details). This document is the single source of truth for how we keep the system safe and
resistant to manipulation. Every phase of development must respect these rules.

## 1. Defense-in-depth principles

1. **Never trust the client.** Every value coming from a browser, mobile app, or webhook is
   validated with a Zod schema (`@hediyola/shared`) on the server before it touches the database.
2. **Least privilege.** The browser/mobile client only ever holds the Supabase **anon** key,
   which is constrained by Row Level Security. The **service-role** key lives only in server-side
   Next.js route handlers / server components and is never bundled into client code.
3. **Row Level Security (RLS) on every table.** No table is readable or writable without an
   explicit policy. See `packages/db/prisma/policies.sql`.
4. **Server-authoritative money.** Prices, totals, and fund balances are recomputed on the
   server from the database at payment time. The client-submitted amount is never trusted — we
   verify it against `registry_items` before creating a payment intent.
5. **Signed webhooks.** Stripe webhooks are verified with `STRIPE_WEBHOOK_SECRET`; Iyzico
   callbacks are verified via signature/hash. Unverified events are rejected with 400.

## 2. Secrets handling

| Secret | Where it may live | Never exposed to |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (route handlers, server actions) | Browser, mobile bundle, git |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Server only | Client |
| `IYZICO_API_KEY`, `IYZICO_SECRET_KEY` | Server only | Client |
| `RESEND_API_KEY` | Server only | Client |
| `*_ANON_KEY`, `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*` | Client + server | — (safe by design, still RLS-bound) |

- `.env` is git-ignored; only `.env.example` (placeholders) is committed.
- CI/hosting secrets are injected via the platform vault (Vercel / EAS), not the repo.

## 3. Authentication

- Supabase Auth (Email/Password, Google OAuth, Apple Sign-In).
- Mobile stores tokens in `expo-secure-store` (encrypted keychain/keystore), never AsyncStorage.
- A Postgres trigger mirrors `auth.users` → `public.profiles` so identity is DB-enforced, not
  client-set. Role (`COUPLE` / `ADMIN`) is stored server-side and never accepted from the client.

## 4. Input validation & injection safety

- All API inputs parsed with Zod; reject on failure (400) before any DB access.
- Prisma uses parameterized queries — no string-concatenated SQL.
- The custom-link scraper (Phase 4) runs with an allowlist of schemes (`https` only), a timeout,
  size limits, and SSRF protection (blocks private/loopback IP ranges).
- User-supplied HTML/markdown (love story, messages) is sanitized before render.

## 5. Payments integrity

- Amounts and item availability re-validated server-side before creating intents.
- Idempotency keys on payment creation to prevent double-charge/replay.
- Order is marked `PAID` **only** from a verified webhook, never from a client redirect.
- Fund balances incremented inside a DB transaction to avoid race conditions / over-funding.

## 6. Transport & headers

- HTTPS everywhere. Strict security headers on web (CSP, HSTS, X-Frame-Options: DENY,
  Referrer-Policy, Permissions-Policy) configured in `next.config.mjs`.
- Rate limiting on payment, payout, auth, and scraper endpoints.

## 7. Privacy

- Couple-private fields (`delivery_address`, `iban`, `passcode`) are excluded from any public
  registry query and protected by RLS so guests can never read them.
- Private registries require a passcode checked server-side (constant-time comparison).

> When in doubt, fail closed. A blocked legitimate request is recoverable; a leaked secret or an
> unauthorized money movement is not.
