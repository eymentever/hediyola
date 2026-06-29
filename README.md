# Hediyola 💍

Premium wedding registry & gift list platform (a Prezola-inspired clone).
Monorepo containing a Next.js web app + admin dashboard, an Expo mobile app, and shared packages.

## 🏗 Architecture

```text
/
├── apps/
│   ├── web/                # Next.js 14 (App Router) — public registries, couple & admin dashboards
│   └── mobile/             # Expo (React Native) — couple companion app
├── packages/
│   ├── db/                 # Prisma schema, Supabase clients, RLS policies
│   ├── shared/             # TS types, Zod schemas, formatters, constants
│   └── config/             # Shared ESLint / Prettier / Tailwind presets
├── package.json            # npm workspaces
└── turbo.json              # Turborepo pipeline
```

## 🛠 Tech Stack

- **Web:** Next.js 14, TypeScript, TailwindCSS, Shadcn UI, React Query, React Hook Form + Zod
- **Mobile:** Expo SDK 51, Expo Router, NativeWind
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime), Prisma ORM
- **Payments:** Stripe (global) + Iyzico (Turkey)
- **Email:** Resend + React Email

## 🚀 Getting Started

```bash
# 1. Install dependencies (root)
npm install

# 2. Configure environment
cp .env.example .env
# fill in Supabase, Stripe, Iyzico, Resend keys

# 3. Generate Prisma client & push schema
npm run db:generate
npm run db:push          # or db:migrate for migration history

# 4. Apply Row Level Security policies (run in Supabase SQL editor)
#    packages/db/prisma/policies.sql

# 5. Run apps
npm run web              # http://localhost:3000
npm run mobile           # Expo dev server
```

## 🔒 Security

Security is treated as a first-class requirement. See [`SECURITY.md`](./SECURITY.md) for the
full model: strict RLS on every table, server-side-only secrets, Zod validation on every
input boundary, signed payment webhooks, and least-privilege Supabase keys.

## 📍 Roadmap

Development follows `ROADMAP.md` phase by phase. **Phase 1 (this scaffold)** is complete:
monorepo, all four workspaces, Prisma schema, Supabase wiring, and env templates.
