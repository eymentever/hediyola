'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from './google-button';
import { signUpAction } from '@/lib/auth/actions';

/** Sign-up form. Password rules mirror the server-side policy. */
export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signUpAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-olive-400/10 p-5 text-center">
        <p className="font-medium text-olive-600">Neredeyse hazır!</p>
        <p className="mt-1 text-sm text-ink-soft">
          E-postana bir doğrulama bağlantısı gönderdik. Hesabını etkinleştirmek için bağlantıya tıkla.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <GoogleButton />
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-blush-100" /> veya <span className="h-px flex-1 bg-blush-100" />
      </div>

      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input id="fullName" name="fullName" type="text" autoComplete="name" required placeholder="Ayşe Yılmaz" />
        </div>
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="ad@ornek.com" />
        </div>
        <div>
          <Label htmlFor="password">Parola</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          <p className="mt-1 text-xs text-ink-soft">
            En az 8 karakter; büyük harf, küçük harf ve rakam içermeli.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-blush-50 px-3 py-2 text-sm text-blush-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Hesap oluşturuluyor…' : 'Kayıt ol'}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="font-medium text-blush-700 hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
