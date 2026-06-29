import Link from 'next/link';
import { Heart, Gift, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Landing page (Phase 1 scaffold).
 * Search + registry browsing (Phase 5) and full flows land in later phases.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center md:py-32">
        <div className="animate-fade-in mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-champagne px-4 py-1.5 text-sm text-olive-600">
            <Heart className="h-4 w-4" /> Premium düğün hediye listesi
          </span>
          <h1 className="text-4xl font-bold leading-tight text-ink md:text-6xl">
            Hayalinizdeki hediyeler, <span className="text-blush-500">tek bir listede</span>
          </h1>
          <p className="mt-6 text-lg text-ink-soft">
            Katalog hediyeleri, balayı fonları ve nakit katkıları zarif bir sayfada toplayın.
            Misafirleriniz saniyeler içinde hediye gönderebilsin.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Listeni oluştur</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/search">Liste ara</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature trio */}
      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:grid-cols-3">
        <Feature
          icon={<Gift className="h-6 w-6" />}
          title="Katalog Hediyeleri"
          body="Özenle seçilmiş ürünleri odaya ve markaya göre listenize ekleyin."
        />
        <Feature
          icon={<Plane className="h-6 w-6" />}
          title="Balayı Fonu"
          body="Maldivler uçuşları ya da ev birikimi için esnek nakit fonları oluşturun."
        />
        <Feature
          icon={<Heart className="h-6 w-6" />}
          title="Kişisel Sayfa"
          body="Aşk hikayenizi, geri sayımı ve galerinizi premium bir tasarımla paylaşın."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-soft transition-transform hover:-translate-y-1">
      <div className="mb-4 inline-flex rounded-xl bg-blush-50 p-3 text-blush-700">{icon}</div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-ink-soft">{body}</p>
    </div>
  );
}
