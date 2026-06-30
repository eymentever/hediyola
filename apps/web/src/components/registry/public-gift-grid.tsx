'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Plus, Gift, Plane, Sparkles } from 'lucide-react';
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

type FilterType = 'ALL' | 'CATALOG' | 'CASH_FUND';

/** Guest-facing gift grid with category filter tabs and premium Prezola styling. */
export function PublicGiftGrid({ slug, items }: { slug: string; items: PublicItem[] }) {
  const [filter, setFilter] = useState<FilterType>('ALL');

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-ink/5 bg-white px-6 py-16 text-center shadow-soft">
        <Gift className="mx-auto h-8 w-8 text-gold-500/80 mb-3" />
        <p className="text-ink-soft text-sm">Bu listeye henüz hediye eklenmemiş.</p>
      </div>
    );
  }

  // Filter logic
  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'CATALOG') return item.type === 'CATALOG' || item.type === 'CUSTOM';
    if (filter === 'CASH_FUND') return item.type === 'CASH_FUND';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs (Prezola style) */}
      <div className="flex justify-center border-b border-ink/5">
        <div className="flex gap-8 text-sm">
          <TabButton
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
            label="Tüm Hediyeler"
            icon={<Sparkles className="h-4 w-4" />}
          />
          <TabButton
            active={filter === 'CATALOG'}
            onClick={() => setFilter('CATALOG')}
            label="Ürünler"
            icon={<Gift className="h-4 w-4" />}
          />
          <TabButton
            active={filter === 'CASH_FUND'}
            onClick={() => setFilter('CASH_FUND')}
            label="Balayı & Nakit Fonları"
            icon={<Plane className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-soft">Bu kategoride ürün bulunmuyor.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <GiftCard key={item.id} slug={slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-4 font-medium transition border-b-2 -mb-[2px] ${
        active
          ? 'border-gold-500 text-ink'
          : 'border-transparent text-ink-soft hover:text-ink'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
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
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink/5 bg-white shadow-soft transition hover:shadow-md">
      <div className="relative h-52 w-full bg-champagne/40">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="350px" />
        )}
        <StatusBadge item={item} fullyPurchased={fullyPurchased} fundClosed={fundClosed} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700/80 mb-1">
          {isFund ? 'Nakit Katkı Fonu' : 'Düğün Hediyesi'}
        </span>
        <h3 className="font-serif text-lg font-semibold text-ink leading-snug">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{item.description}</p>
        )}

        <div className="mt-auto pt-4 border-t border-ink/5">
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
  let label = 'Hediye Et';
  let tone = 'bg-ink/80 text-white';
  if (fullyPurchased || fundClosed) {
    label = 'Alındı';
    tone = 'bg-ink/30 text-ink-soft/80 line-through';
  } else if (item.isGroupGift || item.type === 'CASH_FUND') {
    label = 'Grup Katkısı';
    tone = 'bg-gold-500 text-ink font-semibold';
  }
  return (
    <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
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
    <div className="flex items-center justify-between gap-2">
      <span className="text-lg font-bold text-ink">{formatCurrency(item.price)}</span>
      <Button
        size="sm"
        disabled={disabled || inCart}
        className={`rounded-lg ${
          inCart
            ? 'bg-gold-500 hover:bg-gold-500 text-ink'
            : 'bg-ink hover:bg-ink-soft text-white'
        }`}
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
        {disabled ? 'Alındı' : inCart ? <><Check className="h-4 w-4 mr-1" /> Sepette</> : <><Plus className="h-4 w-4 mr-1" /> Sepete Ekle</>}
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
  const minAmount = item.price > 0 ? item.price : 1;
  const [amount, setAmount] = useState<string>(String(minAmount));
  const pct = item.targetAmount ? completionPercent(item.amountReceived, item.targetAmount) : null;

  return (
    <div className="space-y-3">
      {item.targetAmount && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
            <div className="h-full bg-gold-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-[10px] text-ink-soft font-semibold">
            {formatCurrency(item.amountReceived)} / {formatCurrency(item.targetAmount)} (%{pct} Toplandı)
          </p>
        </div>
      )}
      {closed ? (
        <p className="rounded-lg bg-ink/5 px-3 py-2 text-center text-xs text-ink-soft">
          Bu fon tamamlandı 🎉
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-ink/10 bg-white px-2.5 py-1">
            <span className="text-xs text-ink-soft font-bold">₺</span>
            <Input
              type="number"
              min={1}
              max={LIMITS.maxContribution}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-7 w-16 border-0 bg-transparent p-0 text-sm font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Katkı tutarı"
            />
          </div>
          <Button
            size="sm"
            disabled={inCart}
            className={`flex-1 rounded-lg ${
              inCart
                ? 'bg-gold-500 hover:bg-gold-500 text-ink'
                : 'bg-ink hover:bg-ink-soft text-white'
            }`}
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
            {inCart ? <><Check className="h-4 w-4 mr-1" /> Sepette</> : 'Katkıda Bulun'}
          </Button>
        </div>
      )}
    </div>
  );
}
