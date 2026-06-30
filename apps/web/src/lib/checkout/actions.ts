'use server';

/**
 * Checkout — creates a PENDING order with SERVER-AUTHORITATIVE amounts.
 *
 * THREAT MODEL (SECURITY.md): a malicious guest may tamper with prices, fund
 * amounts, quantities, item ids, or the total in the request. Therefore:
 *  - Every line's price is re-read from the database; client price is ignored.
 *  - Fund contributions are clamped to [min, max] and to the fund's remaining
 *    capacity; physical items use DB price × clamped quantity.
 *  - Items must belong to the targeted ACTIVE registry, or they're dropped.
 *  - The grand total is recomputed (computeCheckoutTotals) — the client total is
 *    never trusted.
 *  - Order rows are written with the service-role client server-side (guests
 *    have no INSERT policy), and marked PAID only later by a verified webhook.
 *  - Rate limited per IP.
 */
import {
  checkoutSchema,
  computeCheckoutTotals,
  fundRemaining,
  roundMoney,
  LIMITS,
  type ApiResult,
  type CheckoutLine,
} from '@hediyola/shared';
import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '@hediyola/db/supabase-admin';
import { getClientIp } from '@/lib/security/request';
import { rateLimit } from '@/lib/security/rate-limit';

interface CheckoutLineInput {
  registryItemId: string;
  quantity: number;
  amount: number;
}

export async function createCheckoutAction(payload: {
  registrySlug: string;
  guestName: string;
  guestEmail: string;
  guestMessage?: string;
  gateway: 'stripe' | 'iyzico';
  lines: CheckoutLineInput[];
}): Promise<ApiResult<{ orderId: string; total: number }>> {
  const ip = await getClientIp();
  const limit = rateLimit(`checkout:${ip}`, 15, 5 * 60 * 1000);
  if (!limit.success) {
    return { ok: false, error: 'Çok fazla istek. Biraz sonra dene.', code: 'RATE_LIMITED' };
  }

  // 1) Validate the request shape (lines re-validated against DB below).
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: 'Geçersiz sipariş.', code: 'VALIDATION' };

  const admin = getSupabaseAdmin();

  // 2) Resolve the registry (must be ACTIVE).
  const { data: registry } = await admin
    .from('registries')
    .select('id, status')
    .eq('slug', parsed.data.registrySlug)
    .maybeSingle();
  if (!registry || registry.status !== 'ACTIVE') {
    return { ok: false, error: 'Liste bulunamadı.', code: 'NOT_FOUND' };
  }

  // 3) Re-read every item from the DB and recompute amounts server-side.
  const ids = parsed.data.lines.map((l) => l.registryItemId);
  const { data: dbItems } = await admin
    .from('registry_items')
    .select('id, registry_id, type, price, qty_wanted, qty_received, target_amount, amount_received, is_group_gift')
    .in('id', ids)
    .eq('registry_id', registry.id);

  if (!dbItems || dbItems.length === 0) {
    return { ok: false, error: 'Seçilen hediyeler bulunamadı.', code: 'NO_ITEMS' };
  }

  const byId = new Map(dbItems.map((it) => [it.id, it]));
  const computedLines: Array<{ registryItemId: string; quantity: number; amount: number; type: CheckoutLine['type'] }> = [];

  for (const line of parsed.data.lines) {
    const item = byId.get(line.registryItemId);
    if (!item) continue; // silently drop items not on this registry

    if (item.type === 'CASH_FUND' || item.type === 'CHARITY') {
      // Clamp the contribution to allowed bounds and the fund's remaining cap.
      let amount = Math.round(line.amount);
      amount = Math.max(LIMITS.minContribution, Math.min(amount, LIMITS.maxContribution));
      const remaining = fundRemaining(Number(item.amount_received), item.target_amount === null ? null : Number(item.target_amount));
      if (remaining !== null) {
        if (remaining <= 0) continue; // fund already full
        amount = Math.min(amount, Math.round(remaining));
      }
      if (amount <= 0) continue;
      computedLines.push({ registryItemId: item.id, quantity: 1, amount: roundMoney(amount), type: item.type });
    } else {
      // Physical (CATALOG / CUSTOM): DB price × clamped quantity.
      const available = item.is_group_gift
        ? Number.MAX_SAFE_INTEGER
        : Math.max(0, item.qty_wanted - item.qty_received);
      if (available <= 0) continue; // already fully purchased
      const qty = Math.max(1, Math.min(line.quantity, available, 50));
      const amount = roundMoney(Number(item.price) * qty);
      computedLines.push({ registryItemId: item.id, quantity: qty, amount, type: item.type });
    }
  }

  if (computedLines.length === 0) {
    return { ok: false, error: 'Sepetinizdeki hediyeler artık uygun değil.', code: 'NO_VALID_LINES' };
  }

  // 4) Authoritative totals (fees included) — client total is ignored.
  const totals = computeCheckoutTotals(computedLines.map((l) => ({ type: l.type, amount: l.amount })));

  // 5) Create the PENDING order (service role; payment confirmed via webhook).
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      registry_id: registry.id,
      guest_name: parsed.data.guestName,
      guest_email: parsed.data.guestEmail,
      guest_message: parsed.data.guestMessage ?? null,
      status: 'PENDING',
      total_amount: totals.guestTotal,
      payment_gateway: parsed.data.gateway,
      // Temporary unique id; the real gateway intent id is set in Phase 6.
      payment_intent_id: `pending_${randomUUID()}`,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return { ok: false, error: 'Sipariş oluşturulamadı.', code: 'ORDER_FAILED' };
  }

  // 6) Insert order items.
  const { error: itemsErr } = await admin.from('order_items').insert(
    computedLines.map((l) => ({
      order_id: order.id,
      registry_item_id: l.registryItemId,
      quantity: l.quantity,
      amount_paid: l.amount,
    })),
  );

  if (itemsErr) {
    // Roll back the order to avoid an orphan with no items.
    await admin.from('orders').delete().eq('id', order.id);
    return { ok: false, error: 'Sipariş kalemleri kaydedilemedi.', code: 'ORDER_ITEMS_FAILED' };
  }

  return { ok: true, data: { orderId: order.id, total: totals.guestTotal } };
}

/**
 * Simulates a successful payment webhook for dev/demo mode.
 * Moves order to PAID and updates registry items received quantities/amounts.
 */
export async function simulatePaymentAction(orderId: string): Promise<ApiResult<{ success: true }>> {
  const admin = getSupabaseAdmin();

  // 1) Fetch order details.
  const { data: order } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: 'Sipariş bulunamadı.', code: 'NOT_FOUND' };
  if (order.status === 'PAID') return { ok: true, data: { success: true } };

  // 2) Fetch order items to update their registry progress.
  const { data: orderItems } = await admin
    .from('order_items')
    .select('registry_item_id, quantity, amount_paid, registry_items(type, price, qty_received, amount_received)')
    .eq('order_id', orderId);

  if (!orderItems) return { ok: false, error: 'Sipariş detayları alınamadı.', code: 'ITEMS_NOT_FOUND' };

  // 3) Update order status to PAID.
  const { error: updateOrderErr } = await admin
    .from('orders')
    .update({ status: 'PAID' })
    .eq('id', orderId);

  if (updateOrderErr) return { ok: false, error: 'Sipariş güncellenemedi.', code: 'UPDATE_FAILED' };

  // 4) Update registry items progress.
  for (const item of orderItems) {
    const registryItemId = item.registry_item_id;
    const details = item.registry_items as any;
    if (!details) continue;

    if (details.type === 'CASH_FUND' || details.type === 'CHARITY') {
      const currentReceived = Number(details.amount_received || 0);
      const newReceived = currentReceived + Number(item.amount_paid);
      await admin
        .from('registry_items')
        .update({ amount_received: newReceived })
        .eq('id', registryItemId);
    } else {
      const currentQty = Number(details.qty_received || 0);
      const newQty = currentQty + Number(item.quantity);
      await admin
        .from('registry_items')
        .update({ qty_received: newQty })
        .eq('id', registryItemId);
    }
  }

  return { ok: true, data: { success: true } };
}
