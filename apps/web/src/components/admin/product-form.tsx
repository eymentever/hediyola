'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCT_CATEGORIES } from '@hediyola/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/registry/image-upload';
import { createProductAction, updateProductAction } from '@/lib/admin/product-actions';

interface ProductInitial {
  id?: string;
  brand?: string;
  title?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  category?: string;
  sku?: string;
  inStock?: boolean;
}

/** Create/edit a catalog product. `adminId` is used for the image upload path. */
export function ProductForm({
  adminId,
  initial = {},
}: {
  adminId: string;
  initial?: ProductInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial.id;
  const [imageUrl, setImageUrl] = useState<string | null>(initial.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    if (!imageUrl) {
      setError('Lütfen bir ürün görseli yükleyin.');
      return;
    }
    formData.set('imageUrl', imageUrl);

    startTransition(async () => {
      const res = isEdit
        ? await updateProductAction(initial.id!, formData)
        : await createProductAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <ImageUpload
        bucket="products"
        userId={adminId}
        value={imageUrl}
        onChange={setImageUrl}
        label="Ürün görseli"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="brand">Marka</Label>
          <Input id="brand" name="brand" defaultValue={initial.brand} required />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={initial.sku} required />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input id="title" name="title" defaultValue={initial.title} required />
      </div>
      <div>
        <Label htmlFor="description">Açıklama</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial.description ?? ''}
          rows={3}
          className="flex w-full rounded-xl border border-blush-100 bg-white px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-500"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Fiyat (₺)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={initial.price}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <select
            id="category"
            name="category"
            defaultValue={initial.category ?? PRODUCT_CATEGORIES[0]}
            className="flex h-11 w-full rounded-xl border border-blush-100 bg-white px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-500"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="inStock" value="true" defaultChecked={initial.inStock ?? true} className="h-4 w-4 accent-blush-500" />
        Stokta
      </label>

      {error && (
        <p className="rounded-lg bg-blush-50 px-3 py-2 text-sm text-blush-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Kaydediliyor…' : isEdit ? 'Güncelle' : 'Ürün ekle'}
      </Button>
    </form>
  );
}
