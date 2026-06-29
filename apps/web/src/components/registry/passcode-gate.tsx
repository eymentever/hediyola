'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyPasscodeAction } from '@/lib/registry/public-actions';

/** Passcode prompt shown for private registries until the guest unlocks it. */
export function PasscodeGate({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set('slug', slug);
    startTransition(async () => {
      const res = await verifyPasscodeAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh(); // re-render the now-unlocked registry
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-blush-100 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-blush-50 p-3 text-blush-700">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Bu liste özel. Görüntülemek için parolayı gir.</p>

        <form action={onSubmit} className="mt-6 space-y-3 text-left">
          <div>
            <Label htmlFor="passcode">Liste parolası</Label>
            <Input id="passcode" name="passcode" type="password" required autoFocus />
          </div>
          {error && <p className="text-sm text-blush-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Kontrol ediliyor…' : 'Listeyi aç'}
          </Button>
        </form>
      </div>
    </div>
  );
}
