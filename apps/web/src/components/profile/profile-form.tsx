'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfileAction } from '@/lib/auth/actions';

/**
 * Profile edit form. Only the full name is editable; email is managed by auth
 * and the role is server-controlled (never sent from the client).
 */
export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      setMessage(
        res.ok
          ? { type: 'ok', text: 'Profil güncellendi.' }
          : { type: 'err', text: res.error },
      );
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Ad Soyad</Label>
        <Input id="fullName" name="fullName" defaultValue={initialName} required minLength={2} maxLength={120} />
      </div>
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" value={email} disabled readOnly />
        <p className="mt-1 text-xs text-ink-soft">E-posta adresi güvenlik nedeniyle buradan değiştirilemez.</p>
      </div>

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === 'ok' ? 'bg-olive-400/10 text-olive-600' : 'bg-blush-50 text-blush-700'
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
      </Button>
    </form>
  );
}
