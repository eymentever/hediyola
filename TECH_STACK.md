# Technical Stack & Architecture - Hediyola

Hediyola is built using a modern, scalable, and type-safe monorepo architecture. Code is shared between the web application, admin panel, and mobile applications to minimize development overhead.

---

## 🏗 1. Monorepo Repository Structure

We utilize **npm workspaces** or **Turborepo** to orchestrate the monorepo:

```text
/
├── apps/
│   ├── web/                # Next.js (App Router) client-facing website & admin panel
│   └── mobile/             # Expo (React Native) iOS/Android app for couples
├── packages/
│   ├── db/                 # Database Prisma schemas and Supabase clients
│   ├── shared/             # TypeScript interfaces, Zod schemas, helper functions
│   └── config/             # Shared ESLint, Prettier, and Tailwind configurations
├── package.json            # Monorepo dependencies and workspaces config
└── turbo.json              # Turborepo task pipeline (optional, but recommended)
```

---

## 🛠 2. Technology Stack & Packages

### 2.1 Web Application (`apps/web`)
- **Framework**: Next.js 14+ (App Router) for Server-Side Rendering (SSR) of public registries (perfect for SEO/fast loading) and client-side dashboards.
- **Styling**: TailwindCSS & Shadcn UI (Radix UI primitives).
- **Icons**: Lucide React.
- **State & Data Fetching**: React Query (TanStack Query) & Supabase Client.
- **Forms & Validation**: React Hook Form with Zod resolver.

### 2.2 Mobile Application (`apps/mobile`)
- **Framework**: Expo (React Native) with SDK 50+.
- **Routing**: Expo Router (File-based navigation, similar to Next.js).
- **Styling**: NativeWind (TailwindCSS for React Native).
- **Icons**: Lucide React Native.
- **Components**: React Native Paper or Tailwind-styled custom components.
- **Barcode Scanner**: `expo-barcode-scanner` / `expo-camera`.
- **Push Notifications**: Expo Notifications service.

### 2.3 Shared Logic (`packages/shared`)
- **Type Definitions**: Common interfaces (e.g., `Registry`, `GiftItem`, `GuestOrder`).
- **Validation**: Zod Schemas shared between backend (Next.js API routes) and frontend (Next.js & React Native forms).
- **Formatters**: Currency helpers, date formatting.

### 2.4 Database & Backend (Supabase)
- **Database**: PostgreSQL hosted on Supabase.
- **Authentication**: Supabase Auth (Email/Password, Google OAuth, Apple Sign-In).
- **Database Access**: Prisma ORM (for schema management, migrations) or direct Supabase JS Client using PostgreSQL Row Level Security (RLS) policies.
- **Storage**: Supabase Storage buckets for:
  - Couple cover photos & profile pictures.
  - Custom product images.
- **Realtime**: Supabase Realtime subscriptions to update the couple's dashboard instantly when a guest makes a purchase.

### 2.5 Payments & Integrations
- **Stripe**: For credit cards and Apple Pay globally.
- **Iyzico**: Localized Turkish gateway (supports local installment cards like Bonus, Axess, World).
- **Email Notifications**: Resend or SendGrid API (coupled with React Email templates) for guest receipts and couple notification emails.

---

## 🔒 3. Security Architecture & RLS

To protect couple information and financial registries, Supabase Row Level Security (RLS) is strictly enforced:

1. **`registries` Table**:
   - `SELECT`: Public access (if status is public) or restricted to guests who provide the correct list passcode.
   - `INSERT`, `UPDATE`, `DELETE`: Restricted to the authenticated user owning the registry (`couple_id = auth.uid()`).
2. **`orders` & `transactions` Tables**:
   - `SELECT`: Restricted to the couple who owns the registry (`registry_id -> registries.couple_id = auth.uid()`) and the Admin. Guests cannot view other guest transactions directly.
3. **`payouts` Table**:
   - `SELECT`, `UPDATE`: Restricted to Admin and the registry owner.
   - `INSERT`: Restricted to the registry owner (couple) requesting a payout.

---

## 📡 4. Key API Endpoints (Next.js API Routes)

All payments and admin requests run through Next.js secure route handlers (`/apps/web/src/app/api/...`):

- **`/api/payment/stripe/create-intent`**: Generates a Stripe checkout intent for the guest.
- **`/api/payment/stripe/webhook`**: Listens to Stripe events, confirms order, updates registry balances.
- **`/api/payment/iyzico/initialize`**: Initializes Iyzico payment form for Turkish credit cards.
- **`/api/payment/iyzico/callback`**: Verification and success callback for Iyzico.
- **`/api/payout/request`**: Handles banking details validation and registers a cash payout request.
- **`/api/admin/payout/approve`**: Admin-only route to approve bank transfers.
- **`/api/products/search`**: Search & scrap products (if couples add custom links, this scrapes details using a scraping library like `cheerio` or `puppeteer`).
