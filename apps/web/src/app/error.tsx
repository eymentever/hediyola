'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Route-segment error boundary. Catches render/runtime errors so the user sees
 * a friendly recovery screen instead of a crash. No raw error text is shown
 * (avoids leaking internals); details go to logs/monitoring.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hook a monitoring service (Sentry, etc.) here in production.
    console.error('Route error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-2xl font-bold text-ink">Bir şeyler ters gitti</h2>
      <p className="mt-2 max-w-md text-ink-soft">
        Beklenmeyen bir hata oluştu. Tekrar denemek sorunu çözebilir.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Tekrar dene</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Ana sayfa
        </Button>
      </div>
    </div>
  );
}
