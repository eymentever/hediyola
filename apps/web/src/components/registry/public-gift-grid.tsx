'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Plus, Users } from 'lucide-react';
import {
  formatCurrency,
  completionPercent,
  fundRemaining,
  LIMITS,
  type ItemType,
} from '@hediyola/shared';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PublicItem {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  targetAmount: number | null;
  amountReceived: number;
  qtyWanted: number;
  qtyReceived: number;
  isGroupGift: boolean;
}

/** Guest-facing gift grid with status badges and add-to-cart controls. */
export function PublicGiftGrid({ slug, items }: { slug: string; items: PublicItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-6 py-12 text-center text-ink-soft">
        Bu listeye henüz hediye eklenmemiş.
      </p>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GiftCard key={item.id} slug={slug} item={item} />
      ))}
    </div>
  );
}

function GiftCard({ slug, item }: { slug: string; item: PublicItem }) {
  const { addLine, isInCart } = useCart();
  const isFund = item.type === 'CASH_FUND';
  const inCart = isInCart(item.id);

  const fullyPurchased = !isFund && !item.isGroupGift && item.qtyReceived >= item.qtyWanted;
  const fundRemain = isFund ? fundRemaining(item.amountReceived, item.targetAmount) : null;
  const fundClosed = isFund && fundRemain !== null && fundRemain <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-blush-100 bg-white shadow-soft">
      <div className="relative h-44 w-full bg-blush-50">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="350px" />
        )}
        <StatusBadge item={item} fullyPurchased={fullyPurchased} fundClosed={fundClosed} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-ink">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
        )}

        {isFund ? (
          <FundFooter slug={slug} item={item} closed={!!fundClosed} inCart={inCart} addLine={addLine} />
        ) : (
          <PhysicalFooter
            slug={slug}
            item={item}
            disabled={fullyPurchased}
            inCart={inCart}
            addLine={addLine}
          />
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  item,
  fullyPurchased,
  fundClosed,
}: {
  item: PublicItem;
  fullyPurchased: boolean;
  fundClosed: boolean;
}) {
  let label = 'Müsait';
  let tone = 'bg-olive-400/90 text-white';
  if (fullyPurchased || fundClosed) {
    label = 'Tamamlandı';
    tone = 'bg-ink/80 text-white';
  } else if (item.isGroupGift || item.type === 'CASH_FUND') {
    label = 'Grup hediyesi';
    tone = 'bg-gold-500/90 text-ink';
  }
  return (
    <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

function PhysicalFooter({
  slug,
  item,
  disabled,
  inCart,
  addLine,
}: {
  slug: string;
  item: PublicItem;
  disabled: boolean;
  inCart: boolean;
  addLine: ReturnType<typeof useCart>['addLine'];
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <span className="font-medium text-ink">{formatCurrency(item.price)}</span>
      <Button
        size="sm"
        disabled={disabled || inCart}
        onClick={() =>
          addLine(slug, {
            registryItemId: item.id,
            type: item.type,
            title: item.title,
            imageUrl: item.imageUrl,
            quantity: 1,
            amount: item.price,
          })
        }
      >
        {disabled ? 'Alındı' : inCart ? <><Check className="h-4 w-4" /> Sepette</> : <><Plus className="h-4 w-4" /> Sepete ekle</>}
      </Button>
    </div>
  );
}

function FundFooter({
  slug,
  item,
  closed,
  inCart,
  addLine,
}: {
  slug: string;
  item: PublicItem;
  closed: boolean;
  inCart: boolean;
  addLine: ReturnType<typeof useCart>['addLine'];
}) {
  // Suggested minimum: the fixed increment (price) if set, else 1 TL.
  const minAmount = item.price > 0 ? item.price : 1;
  const [amount, setAmount] = useState<string>(String(minAmount));
  const pct = item.targetAmount ? completionPercent(item.amountReceived, item.targetAmount) : null;

  return (
    <div className="mt-3">
      {item.targetAmount && (
        <div className="mb-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-blush-50">
            <div className="h-full bg-olive-400" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            {formatCurrency(item.amountReceived)} / {formatCurrency(item.targetAmount)} ({pct}%)
          </p>
        </div>
      )}
      {closed ? (
        <p className="rounded-lg bg-blush-50 px-3 py-2 text-center text-sm text-ink-soft">
          Bu fon tamamlandı 🎉
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm text-ink-soft">₺</span>
            <Input
              type="number"
              min={1}
              max={LIMITS.maxContribution}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9 w-24"
              aria-label="Katkı tutarı"
            />
          </div>
          <Button
            size="sm"
            disabled={inCart}
            onClick={() => {
              const value = Math.max(1, Math.round(Number(amount) || 0));
              addLine(slug, {
                registryItemId: item.id,
                type: item.type,
                title: item.title,
                imageUrl: item.imageUrl,
                quantity: 1,
                amount: value,
              });
            }}
          >
            {inCart ? <><Check className="h-4 w-4" /> Sepette</> : 'Katkıda bulun'}
          </Button>
        </div>
      )}
    </div>
  );
}
