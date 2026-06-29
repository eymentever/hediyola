'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from './google-button';
import { signInAction } from '@/lib/auth/actions';

/**
 * Login form. Validation also happens server-side in signInAction; this is the
 * UX layer. Error messages are intentionally generic to prevent account
 * enumeration.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signInAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.replace(params.get('redirect') ?? '/dashboard');
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <GoogleButton />
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-blush-100" /> veya <span className="h-px flex-1 bg-blush-100" />
      </div>

      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="ad@ornek.com" />
        </div>
        <div>
          <Label htmlFor="password">Parola</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {error && (
          <p className="rounded-lg bg-blush-50 px-3 py-2 text-sm text-blush-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Hesabın yok mu?{' '}
        <Link href="/signup" className="font-medium text-blush-700 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
