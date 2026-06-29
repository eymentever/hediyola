'use server';

/**
 * Admin product catalog actions. Writes are ADMIN-only, enforced both here
 * (requireAdmin) and by RLS on the products table (products_write_admin).
 * Double enforcement = defense in depth.
 */
import { revalidatePath } from 'next/cache';
import { productSchema, type ApiResult } from '@hediyola/shared';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guards';

function parseProduct(formData: FormData) {
  return productSchema.safeParse({
    brand: formData.get('brand'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    price: Number(formData.get('price')),
    imageUrl: formData.get('imageUrl'),
    category: formData.get('category'),
    sku: formData.get('sku'),
    inStock: formData.get('inStock') === 'true',
  });
}

export async function createProductAction(formData: FormData): Promise<ApiResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Yetkisiz işlem.', code: 'FORBIDDEN' };
  }

  const parsed = parseProduct(formData);
  if (!parsed.success) return { ok: false, error: 'Geçersiz ürün bilgileri.', code: 'VALIDATION' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      brand: parsed.data.brand,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      image_url: parsed.data.imageUrl,
      category: parsed.data.category,
      sku: parsed.data.sku,
      in_stock: parsed.data.inStock,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Bu SKU zaten mevcut.', code: 'SKU_TAKEN' };
    return { ok: false, error: 'Ürün eklenemedi.', code: 'CREATE_FAILED' };
  }

  revalidatePath('/admin/products');
  return { ok: true, data: { id: data.id } };
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<ApiResult<{ ok: true }>> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Yetkisiz işlem.', code: 'FORBIDDEN' };
  }

  const parsed = parseProduct(formData);
  if (!parsed.success) return { ok: false, error: 'Geçersiz ürün bilgileri.', code: 'VALIDATION' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({
      brand: parsed.data.brand,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      image_url: parsed.data.imageUrl,
      category: parsed.data.category,
      sku: parsed.data.sku,
      in_stock: parsed.data.inStock,
    })
    .eq('id', productId);

  if (error) return { ok: false, error: 'Ürün güncellenemedi.', code: 'UPDATE_FAILED' };
  revalidatePath('/admin/products');
  return { ok: true, data: { ok: true } };
}

export async function deleteProductAction(productId: string): Promise<ApiResult<{ ok: true }>> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Yetkisiz işlem.', code: 'FORBIDDEN' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) return { ok: false, error: 'Ürün silinemedi.', code: 'DELETE_FAILED' };

  revalidatePath('/admin/products');
  return { ok: true, data: { ok: true } };
}
