# Implementation Roadmap - Hediyola (Prezola Clone)

Follow this step-by-step implementation guide to build the Hediyola platform. Complete each phase sequentially, running tests and verifying functionality before advancing.

---

## 📍 Phase 1: Project Initialization & Monorepo Setup
- [ ] Initialize the Turborepo / NPM Workspace monorepo.
- [ ] Configure `apps/web` with Next.js (App Router, TailwindCSS, Shadcn UI).
- [ ] Configure `apps/mobile` with Expo (TypeScript, NativeWind, Expo Router).
- [ ] Set up the `packages/shared` workspace for TypeScript types and common schemas.
- [ ] Connect the project to Supabase:
  - Initialize the Supabase project.
  - Set up PostgreSQL and run database migrations based on `DATABASE_SCHEMA.md` using Prisma.
  - Configure Supabase environment variables in `.env` files for both Web and Mobile.

---

## 🔒 Phase 2: Authentication & User Profiles
- [ ] Set up Supabase Auth on the Web (Email/Password, Google OAuth).
- [ ] Create a trigger in Supabase to automatically insert a record into the public `profiles` table when a new user signs up in `auth.users`.
- [ ] Implement Auth on Mobile (Expo) using Supabase JS client and secure storage for tokens.
- [ ] Build the profile dashboard page where couples can modify their name and contact info.

---

## 👰🤵 Phase 3: Registry Creation & Customizer (Web)
- [ ] **Onboarding Wizard**: Create a step-by-step registry setup flow for authenticated couples:
  - Wedding details (date, venue, URL slug).
  - Registry privacy (passcode settings).
  - Shipping address (for physical items).
- [ ] **Registry Customize Page**: Build an elegant interface for couples to write their "Love Story", set a countdown, upload background cover photos, and set profile avatars.
- [ ] Set up Supabase Storage buckets for images and set up access control policies.

---

## 🛍 Phase 4: Gift Catalog & Fund Builder (Web)
- [ ] **Admin Product Catalogue Manager**: Form to add/edit products (brand, title, description, price, image, SKU) in the global database.
- [ ] **Catalog browsing for Couples**: Let couples browse physical products by room/category and click "Add to Registry" (specifying quantity).
- [ ] **Honeymoon / Cash Fund Builder**: Dialog allowing couples to create cash funds (e.g. "Maldives flights") with customizable description, target goal, and guest payment rules (any amount vs fixed steps).
- [ ] **Custom Link Adder**: Let couples add products from external sites by pasting URL, scraping details, or inputting title and price manually.

---

## 🛒 Phase 5: Guest Portal & Cart (Web)
- [ ] **Registry Search**: Landing page search bar to find couple registries by name, wedding date, or direct link slug `/list/[slug]`.
- [ ] **Public Registry View**: Elegant, mobile-first view of a couple's registry for guests, displaying countdown, story, and a beautiful grid of gifts showing status ("Available", "Purchased", "Group Gift").
- [ ] **Unified Shopping Cart**: Slide-out cart allowing guests to add physical items and/or input cash contribution amounts, collecting guest name, email, and wedding message.

---

## 💳 Phase 6: Checkout & Payment Gateways (Web)
- [ ] **Stripe Integration**:
  - Implement a backend route `/api/payment/stripe/create-intent` to initialize payment sheets.
  - Implement Stripe Webhook to listen to successful payments, update database order records, mark items as purchased, and increment cash fund balances.
- [ ] **Iyzico Integration (Turkey)**:
  - Build route `/api/payment/iyzico/initialize` implementing the Iyzico 3D Secure checkout form.
  - Handle callback callback route to verify payment integrity and trigger order success updates.
- [ ] **Order Success Page**: Create a beautiful order confirmation screen for guests with their order details and a summary of items purchased.

---

## 📊 Phase 7: Dashboards & Payout Manager (Web)
- [ ] **Couple Dashboard**:
  - Summary cards: Total funds collected, physical items purchased, completion percentage.
  - Feed of guest contributions & personal messages.
  - Thank-You Card status tracker: Checkbox list showing which guest was thanked.
- [ ] **Payout Interface**: Form to link banking info (IBAN, Bank Name, Account Owner) and click "Request Cash Payout" for honeymoon funds.
- [ ] **Admin Panel**:
  - Review and approve/reject payout requests.
  - View overall transaction metrics, brand sales, and shipping status tracker for physical items.

---

## 📱 Phase 8: Mobile App Development (Expo)
- [ ] **Couple Dashboard Mobile View**: Recreate the couple dashboard summary cards and transaction feed in React Native using NativeWind.
- [ ] **Camera Barcode Scanner**: Implement `expo-camera` to scan items at retail outlets, searching the DB by barcode or letting the couple add a custom item on the spot.
- [ ] **Push Notifications**: Trigger push notifications to the couple's phone via Expo Push Notification service whenever a guest completes a purchase.
- [ ] **Share Extension**: Setup a custom share extension (using native config if possible) or a simple copy-paste helper to share custom products from Safari/Chrome.

---

## 🚀 Phase 9: Testing, Optimization & Deployment
- [ ] Implement thorough integration testing for checkout processes and webhook endpoints.
- [ ] Optimize Next.js images and metadata tags for public registries (SEO).
- [ ] Deploy Next.js Web App to **Vercel** or **AWS/DigitalOcean**.
- [ ] Build & submit iOS/Android apps using **Expo Application Services (EAS)**.
