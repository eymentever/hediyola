/**
 * Shared domain types for Hediyola.
 *
 * These mirror the Prisma models in `packages/db` (DATABASE_SCHEMA.md) but are
 * decoupled so that the mobile app and any client can consume them without
 * pulling the Prisma runtime. Enums are declared as const unions to stay
 * portable across web (Next.js) and React Native.
 */

// ---------- Enums (match Prisma enums) ----------

export const ROLES = ['COUPLE', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const REGISTRY_STATUSES = ['DRAFT', 'ACTIVE', 'PAST'] as const;
export type RegistryStatus = (typeof REGISTRY_STATUSES)[number];

export const ITEM_TYPES = ['CATALOG', 'CUSTOM', 'CASH_FUND', 'CHARITY'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ORDER_STATUSES = ['PENDING', 'PAID', 'FAILED', 'SHIPPED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYOUT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

// ---------- Core domain models ----------

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Registry {
  id: string;
  coupleId: string;
  title: string;
  weddingDate: string;
  location: string | null;
  slug: string;
  story: string | null;
  coverImage: string | null;
  avatarImage: string | null;
  /** Never sent to guests; server-only. */
  passcode?: string | null;
  status: RegistryStatus;
  /** Private fields — excluded from public payloads by RLS + select. */
  deliveryAddress?: string | null;
  bankName?: string | null;
  iban?: string | null;
  payoutName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  brand: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  category: string;
  sku: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistryItem {
  id: string;
  registryId: string;
  type: ItemType;
  productId: string | null;
  product?: Product | null;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  externalLink: string | null;
  qtyWanted: number;
  qtyReceived: number;
  targetAmount: number | null;
  amountReceived: number;
  isGroupGift: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  registryId: string;
  guestName: string;
  guestEmail: string;
  guestMessage: string | null;
  status: OrderStatus;
  totalAmount: number;
  paymentGateway: string;
  paymentIntentId: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  registryItemId: string;
  registryItem?: RegistryItem;
  quantity: number;
  amountPaid: number;
}

export interface Payout {
  id: string;
  registryId: string;
  amount: number;
  bankName: string;
  iban: string;
  accountHolder: string;
  status: PayoutStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Composite / view models ----------

/** Public-safe registry shape (private fields stripped) for the guest portal. */
export type PublicRegistry = Omit<
  Registry,
  'passcode' | 'deliveryAddress' | 'bankName' | 'iban' | 'payoutName'
> & {
  items: RegistryItem[];
};

/** A single line a guest is buying/contributing to during checkout. */
export interface CartLine {
  registryItemId: string;
  type: ItemType;
  title: string;
  imageUrl: string | null;
  /** Quantity for physical items; 1 for funds. */
  quantity: number;
  /** Amount the guest pays for this line (major units). */
  amount: number;
}

export interface Cart {
  registrySlug: string;
  lines: CartLine[];
}

/** Standard API response envelope. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
