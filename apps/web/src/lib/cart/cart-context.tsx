'use client';

/**
 * Guest shopping cart — client state with localStorage persistence.
 *
 * The cart is scoped to a single registry (slug). Adding an item from a
 * different registry resets the cart, so a guest never mixes two couples.
 * Amounts here are for UX only; the server recomputes the authoritative total
 * (computeCheckoutTotals) before any charge.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { computeCheckoutTotals, type CartLine, type CheckoutTotals } from '@hediyola/shared';

interface CartState {
  registrySlug: string | null;
  lines: CartLine[];
  totals: CheckoutTotals;
  addLine: (slug: string, line: CartLine) => void;
  removeLine: (registryItemId: string) => void;
  updateAmount: (registryItemId: string, amount: number) => void;
  clear: () => void;
  isInCart: (registryItemId: string) => boolean;
}

const STORAGE_KEY = 'hediyola_cart_v1';

const CartContext = createContext<CartState | null>(null);

interface PersistShape {
  registrySlug: string | null;
  lines: CartLine[];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [registrySlug, setRegistrySlug] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistShape;
        setRegistrySlug(parsed.registrySlug ?? null);
        setLines(Array.isArray(parsed.lines) ? parsed.lines : []);
      }
    } catch {
      // Corrupt storage — start clean.
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration to avoid clobbering).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ registrySlug, lines }));
    } catch {
      // Storage full/unavailable — ignore (cart still works in-memory).
    }
  }, [registrySlug, lines, hydrated]);

  const totals = useMemo(() => computeCheckoutTotals(lines), [lines]);

  function addLine(slug: string, line: CartLine) {
    setLines((prev) => {
      // Switching registries resets the cart.
      if (registrySlug && registrySlug !== slug) {
        setRegistrySlug(slug);
        return [line];
      }
      if (!registrySlug) setRegistrySlug(slug);
      const existing = prev.find((l) => l.registryItemId === line.registryItemId);
      if (existing) {
        return prev.map((l) =>
          l.registryItemId === line.registryItemId
            ? { ...l, quantity: l.quantity + line.quantity, amount: l.amount + line.amount }
            : l,
        );
      }
      return [...prev, line];
    });
  }

  function removeLine(registryItemId: string) {
    setLines((prev) => {
      const next = prev.filter((l) => l.registryItemId !== registryItemId);
      if (next.length === 0) setRegistrySlug(null);
      return next;
    });
  }

  function updateAmount(registryItemId: string, amount: number) {
    setLines((prev) =>
      prev.map((l) => (l.registryItemId === registryItemId ? { ...l, amount } : l)),
    );
  }

  function clear() {
    setLines([]);
    setRegistrySlug(null);
  }

  const isInCart = (registryItemId: string) =>
    lines.some((l) => l.registryItemId === registryItemId);

  const value: CartState = {
    registrySlug,
    lines,
    totals,
    addLine,
    removeLine,
    updateAmount,
    clear,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
