'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ShieldCheck, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency } from '@hediyola/shared';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCheckoutAction, simulatePaymentAction } from '@/lib/checkout/actions';

export default function CheckoutPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const { lines, totals, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMessage, setGuestMessage] = useState('');

  // Prevent accessing checkout with empty cart
  useEffect(() => {
    if (lines.length === 0) {
      router.push(`/list/${slug}`);
    }
  }, [lines, router, slug]);

  if (lines.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const checkoutPayload = {
        registrySlug: slug,
        guestName,
        guestEmail,
        guestMessage,
        gateway: 'stripe' as const, // Dev mode simulation targets stripe
        lines: lines.map((l) => ({
          registryItemId: l.registryItemId,
          quantity: l.quantity,
          amount: l.amount,
        })),
      };

      // 1) Create pending order
      const res = await createCheckoutAction(checkoutPayload);
      if (!res.ok) {
        setError(res.error || 'Sipariş oluşturulurken bir hata oluştu.');
        setLoading(false);
        return;
      }

      const { orderId } = res.data;

      // 2) Simulate payment success immediately for local dev / demo mode
      const paymentRes = await simulatePaymentAction(orderId);
      if (!paymentRes.ok) {
        setError(paymentRes.error || 'Ödeme simülasyonu başarısız oldu.');
        setLoading(false);
        return;
      }

      // 3) Success redirect and clear local cart
      clear();
      router.push(`/list/${slug}/checkout/success?orderId=${orderId}`);
    } catch (err) {
      setError('Bir şeyler yanlış gitti. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-24 selection:bg-gold-300 selection:text-ink">
      {/* Mini Header */}
      <header className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between border-b border-ink/5">
        <Link href={`/list/${slug}`} className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink transition">
          <ArrowLeft className="h-4 w-4" /> Listeye Geri Dön
        </Link>
        <span className="font-serif text-lg font-bold tracking-tight text-ink">HEDİYOLA</span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10 grid gap-10 md:grid-cols-12">
        {/* Left Column: Form */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-ink">Misafir Bilgileri</h1>
            <p className="text-xs text-ink-soft">Çiftin sizi tanıyabilmesi ve teşekkür edebilmesi için bilgilerinizi girin.</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-ink/75">Adınız ve Soyadınız</Label>
              <Input
                id="name"
                required
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="h-11 rounded-lg border-ink/10 focus-visible:ring-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-ink/75">E-posta Adresiniz</Label>
              <Input
                id="email"
                required
                type="email"
                placeholder="Örn: ahmet@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="h-11 rounded-lg border-ink/10 focus-visible:ring-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-ink/75">Çifte Tebrik Mesajınız (İsteğe Bağlı)</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Tebriklerinizi ve güzel dileklerinizi buraya yazabilirsiniz..."
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                className="w-full rounded-lg border border-ink/10 bg-white p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold-500 placeholder:text-ink/30 resize-none"
              />
            </div>

            {/* Payment Method Details */}
            <div className="rounded-xl border border-gold-500/20 bg-gold-300/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-700">
                  <CreditCard className="h-4 w-4 text-gold-500" /> Ödeme Yöntemi
                </span>
                <span className="rounded bg-gold-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-700">
                  Demo Modu
                </span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Platform şu an demo modundadır. Kart bilgisi girmeden doğrudan ödeme simüle edilerek hediye listenin satın alma akışı tamamlanacaktır.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-ink hover:bg-ink-soft text-white py-3.5 h-12 rounded-lg font-semibold shadow-soft flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sipariş Hazırlanıyor...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-gold-500" /> Güvenli Ödemeyi Tamamla
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Cart Summary */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-xl border border-ink/5 bg-white p-6 shadow-soft space-y-5">
            <h2 className="font-serif text-lg font-bold text-ink">Hediye Özeti</h2>

            <ul className="divide-y divide-ink/5 space-y-3">
              {lines.map((l) => (
                <li key={l.registryItemId} className="flex items-center gap-3 pt-3 first:pt-0">
                  {l.imageUrl && (
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-champagne/40 flex-shrink-0">
                      <img src={l.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink font-serif">{l.title}</p>
                    <p className="text-[10px] text-ink-soft">Adet: {l.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-gold-700/90">{formatCurrency(l.amount)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/5 pt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Hediye Alt Toplamı</span>
                <span>{formatCurrency(totals.giftSubtotal)}</span>
              </div>
              {totals.fundSubtotal > 0 && (
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Nakit Fon Katkıları</span>
                  <span>{formatCurrency(totals.fundSubtotal)}</span>
                </div>
              )}
              {totals.handlingFee > 0 && (
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Hizmet Bedeli (%1.9)</span>
                  <span>{formatCurrency(totals.handlingFee)}</span>
                </div>
              )}
              {totals.deliveryFee > 0 && (
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Kargo Bedeli</span>
                  <span>{formatCurrency(totals.handlingFee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-ink/5 pt-3 font-semibold text-ink text-sm">
                <span className="font-serif">Toplam Tutar</span>
                <span className="font-bold text-base text-gold-700">{formatCurrency(totals.guestTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
