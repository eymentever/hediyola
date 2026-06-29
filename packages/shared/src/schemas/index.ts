/**
 * Zod validation schemas — the single validation boundary shared by web forms,
 * mobile forms, and server route handlers. Per SECURITY.md, every input crossing
 * a trust boundary MUST be parsed with one of these before use.
 */
import { z } from 'zod';
import {
  ITEM_TYPES,
  REGISTRY_STATUSES,
  ROLES,
  ORDER_STATUSES,
  PAYOUT_STATUSES,
} from '../types/index';
import { CONTRIBUTION_MODES, LIMITS, PAYMENT_GATEWAYS } from '../constants/index';

// ---------- Primitives ----------

/** URL-safe slug: lowercase letters, numbers, single hyphens. */
export const slugSchema = z
  .string()
  .min(LIMITS.slugMinLength)
  .max(LIMITS.slugMaxLength)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and hyphens');

export const emailSchema = z.string().email().toLowerCase().trim();

export const moneySchema = z
  .number()
  .positive()
  .finite()
  .max(LIMITS.maxItemPrice)
  .refine((n) => Math.round(n * 100) === n * 100, 'Max 2 decimal places');

/** IBAN: light structural check (full validation done server-side at payout). */
export const ibanSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, '').toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/, 'Invalid IBAN format'));

// ---------- Auth ----------

export const signUpSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(72),
  fullName: z.string().min(2).max(120).trim(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(120).trim().optional(),
  // role is server-controlled and intentionally NOT accepted from clients.
});

export const roleSchema = z.enum(ROLES);

// ---------- Registry ----------

export const registryStatusSchema = z.enum(REGISTRY_STATUSES);

export const registryOnboardingSchema = z.object({
  title: z.string().min(2).max(160).trim(),
  weddingDate: z.coerce.date(),
  location: z.string().max(200).trim().optional(),
  slug: slugSchema,
  isPrivate: z.boolean().default(false),
  passcode: z
    .string()
    .min(LIMITS.passcodeMinLength)
    .max(LIMITS.passcodeMaxLength)
    .optional(),
  deliveryAddress: z.string().max(500).trim().optional(),
});

export const registryCustomizeSchema = z.object({
  story: z.string().max(LIMITS.storyMaxLength).optional(),
  coverImage: z.string().url().optional(),
  avatarImage: z.string().url().optional(),
  location: z.string().max(200).trim().optional(),
});

export const registryBankSchema = z.object({
  bankName: z.string().min(2).max(120).trim(),
  iban: ibanSchema,
  payoutName: z.string().min(2).max(120).trim(),
});

/** Passcode check for private registries (server verifies in constant time). */
export const passcodeCheckSchema = z.object({
  slug: slugSchema,
  passcode: z.string().min(1).max(LIMITS.passcodeMaxLength),
});

// ---------- Catalog & registry items ----------

export const itemTypeSchema = z.enum(ITEM_TYPES);

export const productSchema = z.object({
  brand: z.string().min(1).max(120).trim(),
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  price: moneySchema,
  imageUrl: z.string().url(),
  category: z.string().min(1).max(60).trim(),
  sku: z.string().min(1).max(64).trim(),
  inStock: z.boolean().default(true),
});

export const addCatalogItemSchema = z.object({
  registryId: z.string().uuid(),
  productId: z.string().uuid(),
  qtyWanted: z.number().int().min(1).max(50).default(1),
  isGroupGift: z.boolean().default(false),
});

export const cashFundSchema = z.object({
  registryId: z.string().uuid(),
  title: z.string().min(2).max(160).trim(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  targetAmount: moneySchema.optional(),
  contributionMode: z.enum(CONTRIBUTION_MODES).default('any'),
  fixedIncrements: z.array(moneySchema).max(6).optional(),
});

export const customItemSchema = z.object({
  registryId: z.string().uuid(),
  title: z.string().min(2).max(200).trim(),
  description: z.string().max(2000).optional(),
  price: moneySchema,
  imageUrl: z.string().url().optional(),
  externalLink: z.string().url().optional(),
  qtyWanted: z.number().int().min(1).max(50).default(1),
});

/** Server-side scraper input — https only is enforced again in the handler. */
export const scrapeUrlSchema = z.object({
  url: z.string().url().startsWith('https://', 'Only https URLs are allowed'),
});

// ---------- Cart & checkout ----------

export const cartLineSchema = z.object({
  registryItemId: z.string().uuid(),
  type: itemTypeSchema,
  quantity: z.number().int().min(1).max(50).default(1),
  /** Amount is re-validated server-side against the registry item before charge. */
  amount: z
    .number()
    .positive()
    .min(LIMITS.minContribution)
    .max(LIMITS.maxContribution),
});

export const checkoutSchema = z.object({
  registrySlug: slugSchema,
  guestName: z.string().min(1).max(120).trim(),
  guestEmail: emailSchema,
  guestMessage: z.string().max(LIMITS.guestMessageMaxLength).optional(),
  gateway: z.enum(PAYMENT_GATEWAYS),
  lines: z.array(cartLineSchema).min(1).max(50),
});

// ---------- Payouts ----------

export const payoutStatusSchema = z.enum(PAYOUT_STATUSES);
export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const payoutRequestSchema = z.object({
  registryId: z.string().uuid(),
  amount: moneySchema,
  bankName: z.string().min(2).max(120).trim(),
  iban: ibanSchema,
  accountHolder: z.string().min(2).max(120).trim(),
});

export const payoutDecisionSchema = z.object({
  payoutId: z.string().uuid(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
});

// ---------- Inferred types ----------

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RegistryOnboardingInput = z.infer<typeof registryOnboardingSchema>;
export type RegistryCustomizeInput = z.infer<typeof registryCustomizeSchema>;
export type RegistryBankInput = z.infer<typeof registryBankSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CashFundInput = z.infer<typeof cashFundSchema>;
export type CustomItemInput = z.infer<typeof customItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>;
export type PayoutDecisionInput = z.infer<typeof payoutDecisionSchema>;
