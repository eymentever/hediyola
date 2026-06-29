import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@hediyola/shared';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Ürün Yönetimi' };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, brand, title, price, image_url, category, in_stock')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Ürün kataloğu</h1>
          <p className="text-sm text-ink-soft">{products?.length ?? 0} ürün</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Yeni ürün
          </Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-ink-soft">
            Henüz ürün yok. İlk ürünü ekleyerek başla.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link key={p.id} href={`/admin/products/${p.id}`}>
              <Card className="overflow-hidden transition-transform hover:-translate-y-1">
                <div className="relative h-40 w-full bg-blush-50">
                  <Image src={p.image_url} alt={p.title} fill className="object-cover" sizes="300px" />
                  {!p.in_stock && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-white">
                      Stok yok
                    </span>
                  )}
                </div>
                <CardContent className="pt-4">
                  <p className="text-xs uppercase tracking-wide text-gold-700">{p.brand}</p>
                  <p className="line-clamp-1 font-medium text-ink">{p.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{formatCurrency(Number(p.price))}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
