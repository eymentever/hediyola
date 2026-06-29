import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/admin/product-form';
import { DeleteProductButton } from '@/components/admin/delete-product-button';

export const metadata: Metadata = { title: 'Ürün Düzenle' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data: p } = await supabase
    .from('products')
    .select('id, brand, title, description, price, image_url, category, sku, in_stock')
    .eq('id', id)
    .single();

  if (!p) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl">Ürünü düzenle</CardTitle>
          <DeleteProductButton productId={p.id} />
        </CardHeader>
        <CardContent>
          <ProductForm
            adminId={admin.id}
            initial={{
              id: p.id,
              brand: p.brand,
              title: p.title,
              description: p.description,
              price: Number(p.price),
              imageUrl: p.image_url,
              category: p.category,
              sku: p.sku,
              inStock: p.in_stock,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
