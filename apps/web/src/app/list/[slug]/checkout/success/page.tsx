import Link from 'next/link';
import { Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { getSupabaseAdmin } from '@hediyola/db/supabase-admin';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  let guestName = '';
  let totalAmount = 0;

  if (orderId) {
    try {
      const admin = getSupabaseAdmin();
      const { data } = await admin
        .from('orders')
        .select('guest_name, total_amount')
        .eq('id', orderId)
        .maybeSingle();

      if (data) {
        guestName = data.guest_name;
        totalAmount = Number(data.total_amount);
      }
    } catch {
      // Graceful fallback if database lookup fails
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center selection:bg-gold-300 selection:text-ink">
      <div className="w-full max-w-md space-y-6">
        {/* Animated icon container */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gold-300/10 border border-gold-500/20 animate-pulse">
          <Heart className="h-12 w-12 text-gold-500" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-ink">Teşekkür Ederiz!</h1>
          {guestName ? (
            <p className="text-sm text-ink-soft">
              Sevgili <span className="font-semibold text-ink">{guestName}</span>, çifte gönderdiğiniz hediye ve güzel dilekleriniz başarıyla ulaştı.
            </p>
          ) : (
            <p className="text-sm text-ink-soft font-serif">
              Hediyeniz çifte başarıyla ulaştı ve liste güncellendi.
            </p>
          )}
        </div>

        {/* Order Details Card */}
        {orderId && (
          <div className="rounded-xl border border-ink/5 bg-white p-5 text-left space-y-2.5 shadow-soft text-xs">
            <div className="flex items-center justify-between text-ink-soft">
              <span>Sipariş No</span>
              <span className="font-mono font-semibold text-ink">{orderId.slice(0, 8).toUpperCase()}...</span>
            </div>
            {totalAmount > 0 && (
              <div className="flex items-center justify-between text-ink-soft">
                <span>Ödenen Tutar</span>
                <span className="font-bold text-gold-700 text-sm">{totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-ink-soft">
              <span>Durum</span>
              <span className="flex items-center gap-1 font-semibold text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Başarılı (Ödendi)
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <Button asChild className="w-full bg-ink hover:bg-ink-soft text-white py-3 h-12 rounded-lg font-semibold shadow-soft">
            <Link href={`/list/${slug}`}>
              Hediye Listesine Geri Dön
            </Link>
          </Button>
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-900 transition">
            Hediyola Ana Sayfasına Git <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}
