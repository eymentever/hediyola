import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = { title: 'Yeni Ürün' };

export default async function NewProductPage() {
  const admin = await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Yeni ürün ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm adminId={admin.id} />
        </CardContent>
      </Card>
    </div>
  );
}
