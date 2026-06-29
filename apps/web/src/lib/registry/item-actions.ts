'use server';

/**
 * Registry item actions — add catalog products, cash funds, and custom items
 * to a couple's registry.
 *
 * Security:
 *  - Ownership of the target registry is verified on every call.
 *  - For CATALOG items the price/title/image are read from the products table
 *    server-side (never trusted from the client), so a tampered request cannot
 *    inject a fake price. Guest-paid amounts are re-validated again at checkout.
 */
import { revalidatePath } from 'next/cache';
import {
  addCatalogItemSchema,
  cashFundSchema,
  customItemSchema,
  type ApiResult,
} from '@hediyola/shared';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';

/** Confirm the registry exists and belongs to the current user. */
async function assertOwnsRegistry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  registryId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('registries')
    .select('id')
    .eq('id', registryId)
    .eq('couple_id', userId)
    .maybeSingle();
  return !!data;
}

/** Add a catalog product to a registry. Price is taken from the DB product. */
export async function addCatalogItemAction(formData: FormData): Promise<ApiResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };
  }

  const parsed = addCatalogItemSchema.safeParse({
    registryId: formData.get('registryId'),
    productId: formData.get('productId'),
    qtyWanted: Number(formData.get('qtyWanted') ?? 1),
    isGroupGift: formData.get('isGroupGift') === 'true',
  });
  if (!parsed.success) return { ok: false, error: 'Geçersiz istek.', code: 'VALIDATION' };

  const supabase = await createClient();
  if (!(await assertOwnsRegistry(supabase, parsed.data.registryId, user.id))) {
    return { ok: false, error: 'Bu listeye ekleme yetkin yok.', code: 'FORBIDDEN' };
  }

  // Server-authoritative product snapshot — never trust client price/title.
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('title, price, image_url, in_stock')
    .eq('id', parsed.data.productId)
    .single();
  if (prodErr || !product) return { ok: false, error: 'Ürün bulunamadı.', code: 'NOT_FOUND' };
  if (!product.in_stock) return { ok: false, error: 'Ürün stokta değil.', code: 'OUT_OF_STOCK' };

  const { data, error } = await supabase
    .from('registry_items')
    .insert({
      registry_id: parsed.data.registryId,
      type: 'CATALOG',
      product_id: parsed.data.productId,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      qty_wanted: parsed.data.qtyWanted,
      is_group_gift: parsed.data.isGroupGift,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: 'Eklenemedi.', code: 'CREATE_FAILED' };
  revalidatePath(`/dashboard/registry/${parsed.data.registryId}`);
  return { ok: true, data: { id: data.id } };
}

/** Create a cash / honeymoon fund on a registry. */
export async function createCashFundAction(formData: FormData): Promise<ApiResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };
  }

  const rawIncrements = formData.get('fixedIncrements');
  const fixedIncrements = rawIncrements
    ? String(rawIncrements)
        .split(',')
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
    : undefined;

  const parsed = cashFundSchema.safeParse({
    registryId: formData.get('registryId'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    targetAmount: formData.get('targetAmount') ? Number(formData.get('targetAmount')) : undefined,
    contributionMode: formData.get('contributionMode') || 'any',
    fixedIncrements,
  });
  if (!parsed.success) return { ok: false, error: 'Geçersiz fon bilgileri.', code: 'VALIDATION' };

  // For fixed mode, the smallest increment is the unit price; any-amount uses 0
  // (guest chooses the amount at checkout, bounded by platform limits).
  const unitPrice =
    parsed.data.contributionMode === 'fixed' && parsed.data.fixedIncrements?.length
      ? Math.min(...parsed.data.fixedIncrements)
      : 0;

  const supabase = await createClient();
  if (!(await assertOwnsRegistry(supabase, parsed.data.registryId, user.id))) {
    return { ok: false, error: 'Bu listeye ekleme yetkin yok.', code: 'FORBIDDEN' };
  }

  const { data, error } = await supabase
    .from('registry_items')
    .insert({
      registry_id: parsed.data.registryId,
      type: 'CASH_FUND',
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      image_url: parsed.data.imageUrl ?? null,
      price: unitPrice,
      target_amount: parsed.data.targetAmount ?? null,
      is_group_gift: true, // funds always accept partial contributions
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: 'Fon oluşturulamadı.', code: 'CREATE_FAILED' };
  revalidatePath(`/dashboard/registry/${parsed.data.registryId}`);
  return { ok: true, data: { id: data.id } };
}

/** Create a custom item (couple-defined gift or external link). */
export async function createCustomItemAction(formData: FormData): Promise<ApiResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };
  }

  const parsed = customItemSchema.safeParse({
    registryId: formData.get('registryId'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    price: Number(formData.get('price')),
    imageUrl: formData.get('imageUrl') || undefined,
    externalLink: formData.get('externalLink') || undefined,
    qtyWanted: Number(formData.get('qtyWanted') ?? 1),
  });
  if (!parsed.success) return { ok: false, error: 'Geçersiz ürün bilgileri.', code: 'VALIDATION' };

  const supabase = await createClient();
  if (!(await assertOwnsRegistry(supabase, parsed.data.registryId, user.id))) {
    return { ok: false, error: 'Bu listeye ekleme yetkin yok.', code: 'FORBIDDEN' };
  }

  const { data, error } = await supabase
    .from('registry_items')
    .insert({
      registry_id: parsed.data.registryId,
      type: 'CUSTOM',
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      image_url: parsed.data.imageUrl ?? null,
      external_link: parsed.data.externalLink ?? null,
      qty_wanted: parsed.data.qtyWanted,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: 'Eklenemedi.', code: 'CREATE_FAILED' };
  revalidatePath(`/dashboard/registry/${parsed.data.registryId}`);
  return { ok: true, data: { id: data.id } };
}

/** Remove an item from the registry (owner only). */
export async function deleteRegistryItemAction(
  registryId: string,
  itemId: string,
): Promise<ApiResult<{ ok: true }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Oturum bulunamadı.', code: 'UNAUTHENTICATED' };
  }

  const supabase = await createClient();
  if (!(await assertOwnsRegistry(supabase, registryId, user.id))) {
    return { ok: false, error: 'Yetkisiz.', code: 'FORBIDDEN' };
  }

  const { error } = await supabase
    .from('registry_items')
    .delete()
    .eq('id', itemId)
    .eq('registry_id', registryId);

  if (error) return { ok: false, error: 'Silinemedi.', code: 'DELETE_FAILED' };
  revalidatePath(`/dashboard/registry/${registryId}`);
  return { ok: true, data: { ok: true } };
}
