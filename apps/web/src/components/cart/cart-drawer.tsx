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
      {/* Floating trigger (Sleek minimalist style) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-soft transition hover:bg-ink-soft hover:scale-105 active:scale-95"
        aria-label="Sepeti aç"
      >
        <ShoppingBag className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-ink">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="animate-fade-in relative flex h-full w-full max-w-md flex-col bg-cream shadow-soft border-l border-ink/5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/5 px-6 py-5">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink">Alışveriş Sepetiniz</h2>
                <p className="text-xs text-ink-soft mt-0.5">{count} hediye seçildi</p>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                aria-label="Kapat" 
                className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 hover:text-ink transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {count === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <ShoppingBag className="h-10 w-10 text-gold-500/60 mb-3" />
                  <p className="text-sm text-ink-soft">Sepetiniz şu an boş.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li key={l.registryItemId} className="flex items-center gap-4 rounded-xl border border-ink/5 bg-white p-4">
                      {l.imageUrl && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-champagne/40">
                          <img src={l.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink font-serif">{l.title}</p>
                        <p className="text-xs font-bold text-gold-700/90 mt-0.5">{formatCurrency(l.amount)}</p>
                      </div>
                      <button
                        onClick={() => removeLine(l.registryItemId)}
                        aria-label="Kaldır"
                        className="rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {count > 0 && (
              <div className="space-y-3 border-t border-ink/5 bg-white px-6 py-6 shadow-card">
                <Row label="Seçilen Hediyeler" value={totals.giftSubtotal} />
                {totals.fundSubtotal > 0 && <Row label="Nakit Katkı Fonları" value={totals.fundSubtotal} />}
                {totals.handlingFee > 0 && (
                  <Row label="Hizmet Bedeli (%1.9)" value={totals.handlingFee} muted />
                )}
                {totals.deliveryFee > 0 && <Row label="Kargo Bedeli" value={totals.deliveryFee} muted />}
                <div className="flex items-center justify-between border-t border-ink/5 pt-3 font-semibold text-ink">
                  <span className="font-serif">Genel Toplam</span>
                  <span className="text-lg font-bold">{formatCurrency(totals.guestTotal)}</span>
                </div>
                <Button asChild className="mt-3 w-full bg-ink hover:bg-ink-soft text-white py-3 h-12 rounded-lg font-semibold shadow-soft" size="lg">
                  <Link href={registrySlug ? `/list/${registrySlug}/checkout` : '#'} onClick={() => setOpen(false)}>
                    Ödemeye Geç
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
    <div className={`flex items-center justify-between text-xs ${muted ? 'text-ink-soft' : 'text-ink font-medium'}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
