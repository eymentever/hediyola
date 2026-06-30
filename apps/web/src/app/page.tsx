import Link from 'next/link';
import { Heart, Gift, Plane, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Landing page (Sleek & Premium Minimalist Theme with High-End Copywriting).
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream selection:bg-gold-300 selection:text-ink">
      {/* Navigation Header */}
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
          HEDİYOLA
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink transition">
            Giriş Yap
          </Link>
          <Button asChild size="sm" className="bg-ink hover:bg-ink-soft text-white rounded-lg px-4 h-9">
            <Link href="/signup">Başla</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-32">
        <div className="animate-fade-in mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-700">
            <Sparkles className="h-3 w-3 text-gold-500" /> Düğün Hediye Listenizin En Seçkin Hali
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-6xl font-serif">
            Düşlediğiniz gelecek, <br className="hidden md:inline" />
            <span className="italic font-normal text-gold-500">zarif dokunuşlarla</span> şekillensin
          </h1>
          <p className="mt-6 text-base md:text-lg text-ink-soft max-w-xl mx-auto leading-relaxed">
            Seçkin küresel markaların koleksiyonlarını, hayalinizdeki balayı seyahati fonlarını ve anlamlı katkıları, sizin için tasarlanmış özel bir dijital dünyada birleştirin.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-ink hover:bg-ink-soft text-white px-8 h-12 rounded-lg font-medium shadow-soft">
              <Link href="/signup">Listenizi Tasarlayın</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-ink/10 hover:bg-ink/5 text-ink px-8 h-12 rounded-lg font-medium">
              <Link href="/search">Bir Liste Bulun</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature trio */}
      <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-32 md:grid-cols-3">
        <Feature
          icon={<Gift className="h-5 w-5 text-gold-500" />}
          title="Seçkin Marka Koleksiyonları"
          body="Ev tasarımı, mutfak ve yaşam alanlarınız için özenle seçilmiş dünya markalarını listenize dahil edin."
        />
        <Feature
          icon={<Plane className="h-5 w-5 text-gold-500" />}
          title="Balayı & Seyahat Potları"
          body="Hayalini kurduğunuz seyahatler, akşam yemekleri veya yeni ev birikiminiz için misafirlerinizin katılabileceği özel fonlar oluşturun."
        />
        <Feature
          icon={<Heart className="h-5 w-5 text-gold-500" />}
          title="Kişisel Düğün Sayfanız"
          body="Aşk hikayenizi, heyecanlı geri sayımınızı ve detayları en asil, modern ve minimalist tasarım çizgisiyle misafirlerinize sunun."
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
    <div className="rounded-xl border border-ink/5 bg-white p-8 shadow-soft transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="mb-5 inline-flex rounded-lg bg-gold-300/10 p-3 border border-gold-500/10">{icon}</div>
      <h3 className="text-lg font-semibold text-ink font-serif mb-2">{title}</h3>
      <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
