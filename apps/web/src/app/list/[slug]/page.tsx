import type { Metadata } from 'next';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Heart } from 'lucide-react';
import { formatDate, daysUntil } from '@hediyola/shared';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { unlockCookieName } from '@/lib/registry/utils';
import { PasscodeGate } from '@/components/registry/passcode-gate';
import { PublicGiftGrid, type PublicItem } from '@/components/registry/public-gift-grid';
import { CartDrawer } from '@/components/cart/cart-drawer';

/** Generate SEO metadata from the public registry (no private fields). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) return { title: `Liste: ${slug} · Hediyola` };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('registries')
      .select('title, story, cover_image')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (!data) return { title: 'Liste bulunamadı' };
    return {
      title: data.title,
      description: data.story?.slice(0, 160) ?? 'Hediyola düğün hediye listesi',
      openGraph: { images: data.cover_image ? [data.cover_image] : [] },
    };
  } catch {
    return { title: `Liste: ${slug} · Hediyola` };
  }
}

/** Shown when Supabase is not yet configured. */
function ComingSoonView({ slug }: { slug: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blush-100">
          <Heart className="h-10 w-10 text-blush-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink">
          hediyola.com/list/<span className="text-blush-500">{slug}</span>
        </h1>
        <p className="mt-4 text-ink-soft">
          Bu hediye listesi henüz aktive edilmemiş ya da platform kurulumu tamamlanmamış.
          Çiftlerin listesi burada çok yakında görünecek! 🎁
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-blush-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blush-600"
        >
          Ana sayfaya dön
        </a>
      </div>
    </main>
  );
}

export default async function PublicRegistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // When Supabase is not configured, show a friendly placeholder.
  if (!isSupabaseConfigured()) {
    return <ComingSoonView slug={slug} />;
  }

  let registry: {
    id: string;
    title: string;
    slug: string;
    story: string | null;
    location: string | null;
    cover_image: string | null;
    avatar_image: string | null;
    wedding_date: string;
    passcode?: string | null;
  } | null = null;

  try {
    const supabase = await createClient();

    // Public-safe fields only — never select passcode / delivery_address / iban.
    const { data } = await supabase
      .from('registries')
      .select('id, title, slug, story, location, cover_image, avatar_image, wedding_date, passcode')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    registry = data;
  } catch {
    notFound();
  }

  if (!registry) notFound();

  const isPrivate = !!registry.passcode;
  const cookieStore = await cookies();
  const unlocked = cookieStore.get(unlockCookieName(registry.id))?.value === '1';

  if (isPrivate && !unlocked) {
    return <PasscodeGate slug={registry.slug} title={registry.title} />;
  }

  // Items (RLS allows reading items of an ACTIVE registry).
  let items: PublicItem[] = [];
  try {
    const supabase = await createClient();
    const { data: rawItems } = await supabase
      .from('registry_items')
      .select(
        'id, type, title, description, price, image_url, target_amount, amount_received, qty_wanted, qty_received, is_group_gift',
      )
      .eq('registry_id', registry.id)
      .order('created_at', { ascending: false });

    items = (rawItems ?? []).map((it) => ({
      id: it.id,
      type: it.type,
      title: it.title,
      description: it.description,
      price: Number(it.price),
      imageUrl: it.image_url,
      targetAmount: it.target_amount === null ? null : Number(it.target_amount),
      amountReceived: Number(it.amount_received),
      qtyWanted: it.qty_wanted,
      qtyReceived: it.qty_received,
      isGroupGift: it.is_group_gift,
    }));
  } catch {
    // Items fetch failed — show empty list.
  }

  const days = daysUntil(registry.wedding_date);

  return (
    <main className="min-h-screen bg-cream pb-24">
      {/* Hero */}
      <header className="relative">
        <div className="relative h-64 w-full bg-blush-100 md:h-80">
          {registry.cover_image && (
            <Image
              src={registry.cover_image}
              alt={registry.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-ink/20" />
        </div>

        <div className="mx-auto -mt-16 max-w-4xl px-4 text-center">
          {registry.avatar_image && (
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-cream bg-white">
              <Image src={registry.avatar_image} alt="" fill className="object-cover" sizes="112px" />
            </div>
          )}
          <h1 className="mt-4 font-serif text-3xl font-bold text-ink md:text-4xl">{registry.title}</h1>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDate(registry.wedding_date)}
            </span>
            {registry.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {registry.location}
              </span>
            )}
            {days > 0 && (
              <span className="flex items-center gap-1.5 text-blush-700">
                <Heart className="h-4 w-4" /> {days} gün kaldı
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Story */}
      {registry.story && (
        <section className="mx-auto mt-8 max-w-2xl px-4 text-center">
          <p className="whitespace-pre-line leading-relaxed text-ink-soft">{registry.story}</p>
        </section>
      )}

      {/* Gifts */}
      <section className="mx-auto mt-10 max-w-5xl px-4">
        <h2 className="mb-5 text-center font-serif text-2xl font-bold text-ink">Hediye Listesi</h2>
        <PublicGiftGrid slug={registry.slug} items={items} />
      </section>

      <CartDrawer />
    </main>
  );
}
