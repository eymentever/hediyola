'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '@hediyola/shared';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';

/** Floating cart button + slide-out drawer. Shown on public registry pages. */
export function CartDrawer() {
  const { lines, totals, registrySlug, removeLine } = useCart();
  const [open, setOpen] = useState(false);
  const count = lines.length;

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blush-500 px-5 py-3 text-white shadow-card transition-transform hover:scale-105"
        aria-label="Sepeti aç"
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-medium text-ink">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="animate-fade-in relative flex h-full w-full max-w-md flex-col bg-cream shadow-soft">
            <div className="flex items-center justify-between border-b border-blush-100 px-5 py-4">
              <h2 className="font-serif text-xl font-bold text-ink">Sepetin</h2>
              <button onClick={() => setOpen(false)} aria-label="Kapat" className="rounded-lg p-1.5 hover:bg-blush-50">
                <X className="h-5 w-5 text-ink" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {count === 0 ? (
                <p className="py-12 text-center text-ink-soft">Sepetin boş.</p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li key={l.registryItemId} className="flex items-center gap-3 rounded-xl bg-white p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{l.title}</p>
                        <p className="text-xs text-ink-soft">{formatCurrency(l.amount)}</p>
                      </div>
                      <button
                        onClick={() => removeLine(l.registryItemId)}
                        aria-label="Kaldır"
                        className="rounded-lg p-2 text-ink-soft hover:bg-blush-50 hover:text-blush-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {count > 0 && (
              <div className="space-y-2 border-t border-blush-100 px-5 py-4">
                <Row label="Hediyeler" value={totals.giftSubtotal} />
                {totals.fundSubtotal > 0 && <Row label="Fon katkıları" value={totals.fundSubtotal} />}
                {totals.handlingFee > 0 && (
                  <Row label="İşlem ücreti (%1,9)" value={totals.handlingFee} muted />
                )}
                {totals.deliveryFee > 0 && <Row label="Kargo" value={totals.deliveryFee} muted />}
                <div className="flex items-center justify-between border-t border-blush-100 pt-2 font-medium text-ink">
                  <span>Toplam</span>
                  <span>{formatCurrency(totals.guestTotal)}</span>
                </div>
                <Button asChild className="mt-2 w-full" size="lg">
                  <Link href={registrySlug ? `/list/${registrySlug}/checkout` : '#'} onClick={() => setOpen(false)}>
                    Ödemeye geç
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${muted ? 'text-ink-soft' : 'text-ink'}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
