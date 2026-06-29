import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Friendly 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-serif text-6xl font-bold text-blush-500">404</p>
      <h1 className="mt-3 font-serif text-2xl font-bold text-ink">Sayfa bulunamadı</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Ana sayfaya dön</Link>
      </Button>
    </div>
  );
}
