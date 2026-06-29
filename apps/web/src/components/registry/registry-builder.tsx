'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Gift, Plane, Link2, Trash2, Plus, Loader2 } from 'lucide-react';
import { formatCurrency, PRODUCT_CATEGORIES, type ItemType } from '@hediyola/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  addCatalogItemAction,
  createCashFundAction,
  createCustomItemAction,
  deleteRegistryItemAction,
} from '@/lib/registry/item-actions';

interface Product {
  id: string;
  brand: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
}
interface Item {
  id: string;
  type: ItemType;
  title: string;
  price: number;
  image_url: string | null;
  target_amount: number | null;
  amount_received: number;
}

type Tab = 'catalog' | 'fund' | 'custom';

/** Registry gift builder: add catalog products, cash funds, custom items. */
export function RegistryBuilder({
  registryId,
  products,
  items,
}: {
  registryId: string;
  products: Product[];
  items: Item[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('catalog');
  const refresh = () => router.refresh();

  return (
    <div className="space-y-8">
      {/* Current items */}
      <section>
        <h2 className="mb-3 font-serif text-xl font-bold text-ink">Listendeki hediyeler ({items.length})</h2>
        {items.length === 0 ? (
          <p className="rounded-xl bg-blush-50 px-4 py-6 text-center text-sm text-ink-soft">
            Henüz hediye eklemedin. Aşağıdan başla.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((it) => (
              <ItemRow key={it.id} registryId={registryId} item={it} onChange={refresh} />
            ))}
          </div>
        )}
      </section>

      {/* Add tabs */}
      <section>
        <div className="mb-4 flex gap-2">
          <TabButton active={tab === 'catalog'} onClick={() => setTab('catalog')} icon={<Gift className="h-4 w-4" />}>
            Katalog
          </TabButton>
          <TabButton active={tab === 'fund'} onClick={() => setTab('fund')} icon={<Plane className="h-4 w-4" />}>
            Nakit / Balayı Fonu
          </TabButton>
          <TabButton active={tab === 'custom'} onClick={() => setTab('custom')} icon={<Link2 className="h-4 w-4" />}>
            Özel Ürün
          </TabButton>
        </div>

        {tab === 'catalog' && <CatalogPicker registryId={registryId} products={products} onAdded={refresh} />}
        {tab === 'fund' && <FundForm registryId={registryId} onAdded={refresh} />}
        {tab === 'custom' && <CustomForm registryId={registryId} onAdded={refresh} />}
      </section>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition-colors ${
        active ? 'bg-blush-500 text-white' : 'bg-white text-ink hover:bg-blush-50'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ItemRow({
  registryId,
  item,
  onChange,
}: {
  registryId: string;
  item: Item;
  onChange: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blush-100 bg-white p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-blush-50">
        {item.image_url && <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="56px" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{item.title}</p>
        <p className="text-xs text-ink-soft">
          {item.type === 'CASH_FUND'
            ? `Fon${item.target_amount ? ` · Hedef ${formatCurrency(Number(item.target_amount))}` : ''}`
            : formatCurrency(Number(item.price))}
        </p>
      </div>
      <button
        type="button"
        aria-label="Kaldır"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteRegistryItemAction(registryId, item.id);
            onChange();
          })
        }
        className="rounded-lg p-2 text-ink-soft hover:bg-blush-50 hover:text-blush-700"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

function CatalogPicker({
  registryId,
  products,
  onAdded,
}: {
  registryId: string;
  products: Product[];
  onAdded: () => void;
}) {
  const [category, setCategory] = useState<string>('all');
  const filtered = category === 'all' ? products : products.filter((p) => p.category === category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <CategoryChip active={category === 'all'} onClick={() => setCategory('all')}>
          Tümü
        </CategoryChip>
        {PRODUCT_CATEGORIES.map((c) => (
          <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </CategoryChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-blush-50 px-4 py-6 text-center text-sm text-ink-soft">
          Bu kategoride ürün yok.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <CatalogCard key={p.id} registryId={registryId} product={p} onAdded={onAdded} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        active ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:bg-blush-50'
      }`}
    >
      {children}
    </button>
  );
}

function CatalogCard({
  registryId,
  product,
  onAdded,
}: {
  registryId: string;
  product: Product;
  onAdded: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function add() {
    const fd = new FormData();
    fd.set('registryId', registryId);
    fd.set('productId', product.id);
    fd.set('qtyWanted', '1');
    startTransition(async () => {
      const res = await addCatalogItemAction(fd);
      if (res.ok) {
        setAdded(true);
        onAdded();
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blush-100 bg-white">
      <div className="relative h-36 w-full bg-blush-50">
        <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="300px" />
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-gold-700">{product.brand}</p>
        <p className="line-clamp-1 text-sm font-medium text-ink">{product.title}</p>
        <p className="mt-0.5 text-sm text-ink-soft">{formatCurrency(Number(product.price))}</p>
        <Button type="button" size="sm" className="mt-2 w-full" onClick={add} disabled={pending || added}>
          {added ? 'Eklendi ✓' : pending ? 'Ekleniyor…' : <><Plus className="h-4 w-4" /> Listeye ekle</>}
        </Button>
      </div>
    </div>
  );
}

function FundForm({ registryId, onAdded }: { registryId: string; onAdded: () => void }) {
  const [mode, setMode] = useState<'any' | 'fixed'>('any');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set('registryId', registryId);
    formData.set('contributionMode', mode);
    startTransition(async () => {
      const res = await createCashFundAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onAdded();
      (document.getElementById('fund-form') as HTMLFormElement | null)?.reset();
    });
  }

  return (
    <form id="fund-form" action={onSubmit} className="max-w-lg space-y-4 rounded-2xl border border-blush-100 bg-white p-5">
      <div>
        <Label htmlFor="fund-title">Fon adı</Label>
        <Input id="fund-title" name="title" required placeholder="Maldivler Balayı Uçuşları" />
      </div>
      <div>
        <Label htmlFor="fund-desc">Açıklama</Label>
        <textarea
          id="fund-desc"
          name="description"
          rows={2}
          className="flex w-full rounded-xl border border-blush-100 bg-white px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fund-target">Hedef tutar (₺, opsiyonel)</Label>
          <Input id="fund-target" name="targetAmount" type="number" step="0.01" min="0" />
        </div>
        <div>
          <Label htmlFor="fund-mode">Katkı şekli</Label>
          <select
            id="fund-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'any' | 'fixed')}
            className="flex h-11 w-full rounded-xl border border-blush-100 bg-white px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-500"
          >
            <option value="any">İstediği tutar</option>
            <option value="fixed">Sabit adımlar</option>
          </select>
        </div>
      </div>
      {mode === 'fixed' && (
        <div>
          <Label htmlFor="fund-incr">Sabit tutarlar (virgülle)</Label>
          <Input id="fund-incr" name="fixedIncrements" placeholder="50, 100, 250" />
        </div>
      )}

      {error && <p className="rounded-lg bg-blush-50 px-3 py-2 text-sm text-blush-700">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Ekleniyor…' : 'Fonu ekle'}
      </Button>
    </form>
  );
}

function CustomForm({ registryId, onAdded }: { registryId: string; onAdded: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pending, startTransition] = useTransition();

  async function scrape(url: string) {
    if (!url) return;
    setScraping(true);
    setError(null);
    try {
      const res = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (json.ok) {
        if (json.data.title) setTitle(json.data.title);
        if (json.data.price) setPrice(String(json.data.price));
        if (json.data.imageUrl) setImageUrl(json.data.imageUrl);
      } else {
        setError(json.error ?? 'Bağlantıdan bilgi alınamadı, elle doldurabilirsin.');
      }
    } catch {
      setError('Bağlantıdan bilgi alınamadı, elle doldurabilirsin.');
    } finally {
      setScraping(false);
    }
  }

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set('registryId', registryId);
    if (imageUrl) formData.set('imageUrl', imageUrl);
    startTransition(async () => {
      const res = await createCustomItemAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onAdded();
      setTitle('');
      setPrice('');
      setImageUrl('');
    });
  }

  return (
    <form action={onSubmit} className="max-w-lg space-y-4 rounded-2xl border border-blush-100 bg-white p-5">
      <div>
        <Label htmlFor="custom-link">Ürün bağlantısı (opsiyonel)</Label>
        <div className="flex gap-2">
          <Input id="custom-link" name="externalLink" type="url" placeholder="https://..." />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              scrape((document.getElementById('custom-link') as HTMLInputElement | null)?.value ?? '')
            }
            disabled={scraping}
          >
            {scraping ? 'Getiriliyor…' : 'Getir'}
          </Button>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Bağlantıyı yapıştır, bilgileri otomatik çekelim (yalnızca https).
        </p>
      </div>
      <div>
        <Label htmlFor="custom-title">Başlık</Label>
        <Input id="custom-title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="custom-price">Fiyat (₺)</Label>
        <Input
          id="custom-price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      {imageUrl && (
        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-blush-50">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="400px" />
        </div>
      )}

      {error && <p className="rounded-lg bg-blush-50 px-3 py-2 text-sm text-blush-700">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Ekleniyor…' : 'Ürünü ekle'}
      </Button>
    </form>
  );
}
