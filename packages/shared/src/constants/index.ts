/**
 * Shared application-wide constants for Hediyola.
 * Used across web, mobile, and server code to keep behaviour consistent.
 */

/** Supported display currencies. Money is stored as Decimal in the DB. */
export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = 'TRY';

/** Locale used by formatters (Turkey-first product). */
export const DEFAULT_LOCALE = 'tr-TR';

/** Payment gateways. Iyzico for Turkish cards, Stripe globally. */
export const PAYMENT_GATEWAYS = ['stripe', 'iyzico'] as const;
export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

/** Physical catalog rooms/categories surfaced in the couple browser. */
export const PRODUCT_CATEGORIES = [
  'Kitchen',
  'Bedroom',
  'Living Room',
  'Dining',
  'Bathroom',
  'Outdoor',
  'Electronics',
  'Experiences',
  'Other',
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Cash-fund contribution modes. */
export const CONTRIBUTION_MODES = ['any', 'fixed'] as const;
export type ContributionMode = (typeof CONTRIBUTION_MODES)[number];

/** Common fixed-increment presets offered to couples for cash funds. */
export const FIXED_INCREMENT_PRESETS = [50, 100, 250, 500] as const;

/** Supabase Storage bucket names. */
export const STORAGE_BUCKETS = {
  registryCovers: 'registry-covers',
  registryAvatars: 'registry-avatars',
  customItems: 'custom-items',
  products: 'products',
} as const;

/** Money / validation limits (in major currency units). */
export const LIMITS = {
  minContribution: 1,
  maxContribution: 100_000,
  minItemPrice: 0.01,
  maxItemPrice: 1_000_000,
  slugMinLength: 3,
  slugMaxLength: 60,
  passcodeMinLength: 4,
  passcodeMaxLength: 32,
  guestMessageMaxLength: 500,
  storyMaxLength: 5000,
} as const;

/**
 * Platform revenue / fee model.
 *
 * Modeled on Prezola's approach (researched):
 *  - Physical products: platform earns the wholesale → retail markup; the gift
 *    is free to the guest (delivery fee only under a free-shipping threshold).
 *  - Cash / honeymoon funds: a small handling fee is added ON TOP and paid by
 *    the GUEST, so the couple receives the full gifted amount. This just covers
 *    payment-gateway costs (not core profit).
 *  - Charity funds: no fee (platform absorbs the cost).
 *  - Couples: the service is free to couples.
 *
 * All rates are configurable here so the business model can be tuned centrally.
 * Amounts are in the platform's major currency unit (TRY by default).
 */
export const PLATFORM_FEES = {
  /** Handling fee added on top of cash-fund contributions, paid by the guest. */
  cashFundHandlingRate: 0.019, // 1.9%
  /** Charity contributions are fee-free. */
  charityHandlingRate: 0,
  /** Orders at/above this subtotal ship free. */
  freeDeliveryThreshold: 1500,
  /** Flat delivery fee applied to physical-only orders below the threshold. */
  deliveryFee: 49.9,
} as const;

/** Route helpers for the public registry. */
export const ROUTES = {
  registry: (slug: string) => `/list/${slug}`,
  orderSuccess: (orderId: string) => `/order/${orderId}/success`,
} as const;
