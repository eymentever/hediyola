import type { Metadata } from 'next';
import { Search, Heart } from 'lucide-react';
import { SearchForm } from '@/components/registry/search-form';

export const metadata: Metadata = {
  title: 'Liste Ara · Hediyola',
  description: 'Sevdiklerinizin düğün hediye listesini bulun.',
};

/**
 * Registry search page — Phase 5.
 * Full implementation coming soon; this scaffold renders a functional
 * search bar so guests can at least navigate directly to /list/[slug].
 */
export default function SearchPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blush-100">
          <Search className="h-10 w-10 text-blush-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink">Liste Ara</h1>
        <p className="mt-3 text-ink-soft">
          Çiftin adını veya liste bağlantısını girerek doğrudan hediye listesine ulaşabilirsiniz.
        </p>

        {/* Direct slug lookup form (Client component) */}
        <SearchForm />

        <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-soft">
          <Heart className="h-4 w-4 text-blush-400" />
          Arama, Aralık 2026&apos;da tam kapasiteyle açılacak.
        </p>
      </div>
    </main>
  );
}
