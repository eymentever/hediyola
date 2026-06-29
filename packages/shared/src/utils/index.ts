/**
 * Shared pure helper functions (formatting, slugs, money math).
 * No side effects, safe to import in web, mobile, and server.
 */
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  PLATFORM_FEES,
  type Currency,
} from '../constants/index';
import type { ItemType } from '../types/index';

/** Format a numeric amount as a localized currency string. */
export function formatCurrency(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format an ISO date string / Date as a localized long date. */
export function formatDate(
  date: string | Date,
  locale: string = DEFAULT_LOCALE,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/** Whole days from now until the wedding date (negative if in the past). */
export function daysUntil(date: string | Date): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const ms = target.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Convert arbitrary text into a URL-safe slug candidate. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Completion percentage of a registry given total value and amount received. */
export function completionPercent(received: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((received / total) * 100));
}

/**
 * Remaining capacity a guest may contribute to a cash fund, respecting an
 * optional target. Returns null when the fund has no cap.
 */
export function fundRemaining(
  amountReceived: number,
  targetAmount: number | null,
): number | null {
  if (targetAmount == null) return null;
  return Math.max(0, targetAmount - amountReceived);
}

/** Round to 2 decimals using integer math to avoid float drift. */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** Sum of cart line amounts, rounded to money precision. */
export function cartTotal(lines: Array<{ amount: number }>): number {
  return roundMoney(lines.reduce((sum, l) => sum + l.amount, 0));
}

export interface CheckoutLine {
  type: ItemType;
  amount: number;
}

export interface CheckoutTotals {
  /** Physical gifts (CATALOG + CUSTOM) subtotal. */
  giftSubtotal: number;
  /** Cash + honeymoon fund contributions subtotal. */
  fundSubtotal: number;
  /** Charity contributions subtotal (fee-free). */
  charitySubtotal: number;
  /** Handling fee added on top of cash funds (guest-paid). */
  handlingFee: number;
  /** Delivery fee for physical gifts below the free-shipping threshold. */
  deliveryFee: number;
  /** Grand total the guest pays. */
  guestTotal: number;
}

/**
 * Compute checkout totals and fees from cart lines, following the platform fee
 * model (see PLATFORM_FEES). This is the SAME function the server uses to
 * recompute the authoritative total at payment time — the client total is never
 * trusted. Keeping it in shared guarantees client and server agree.
 */
export function computeCheckoutTotals(lines: CheckoutLine[]): CheckoutTotals {
  let giftSubtotal = 0;
  let fundSubtotal = 0;
  let charitySubtotal = 0;

  for (const line of lines) {
    if (line.type === 'CASH_FUND') fundSubtotal += line.amount;
    else if (line.type === 'CHARITY') charitySubtotal += line.amount;
    else giftSubtotal += line.amount; // CATALOG, CUSTOM
  }

  const handlingFee = roundMoney(fundSubtotal * PLATFORM_FEES.cashFundHandlingRate);
  const deliveryFee =
    giftSubtotal > 0 && giftSubtotal < PLATFORM_FEES.freeDeliveryThreshold
      ? PLATFORM_FEES.deliveryFee
      : 0;

  const guestTotal = roundMoney(
    giftSubtotal + fundSubtotal + charitySubtotal + handlingFee + deliveryFee,
  );

  return {
    giftSubtotal: roundMoney(giftSubtotal),
    fundSubtotal: roundMoney(fundSubtotal),
    charitySubtotal: roundMoney(charitySubtotal),
    handlingFee,
    deliveryFee,
    guestTotal,
  };
}

/**
 * Constant-time string comparison to mitigate timing attacks on passcode
 * checks. Both inputs are compared in full regardless of mismatch position.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still walk a fixed-length loop to reduce length-based timing signal.
    let acc = 1;
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      acc &= a.charCodeAt(i % (a.length || 1)) === b.charCodeAt(i % (b.length || 1)) ? 1 : 0;
    }
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
