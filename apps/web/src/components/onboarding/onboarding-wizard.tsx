'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { slugify, LIMITS } from '@hediyola/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createRegistryAction, checkSlugAvailability } from '@/lib/registry/actions';

type SlugState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const STEPS = ['Düğün Detayları', 'Gizlilik', 'Kargo Adresi'] as const;

/**
 * Three-step registry onboarding wizard. Final submission calls the server
 * action which re-validates everything; this component handles UX only.
 */
export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [location, setLocation] = useState('');
  const [slug, setSlug] = useState('');
  const [slugState, setSlugState] = useState<SlugState>('idle');
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  function onTitleBlur() {
    if (title && !slug) {
      const s = slugify(title);
      setSlug(s);
      void verifySlug(s);
    }
  }

  async function verifySlug(value: string) {
    if (value.length < LIMITS.slugMinLength) {
      setSlugState('invalid');
      return;
    }
    setSlugState('checking');
    const res = await checkSlugAvailability(value);
    if (!res.ok) {
      setSlugState('invalid');
      return;
    }
    setSlugState(res.data.available ? 'available' : 'taken');
  }

  function canProceedStep0() {
    return title.trim().length >= 2 && weddingDate !== '' && slugState === 'available';
  }
  function canProceedStep1() {
    return !isPrivate || passcode.length >= LIMITS.passcodeMinLength;
  }

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set('title', title);
    fd.set('weddingDate', weddingDate);
    fd.set('location', location);
    fd.set('slug', slug);
    fd.set('isPrivate', String(isPrivate));
    if (isPrivate) fd.set('passcode', passcode);
    fd.set('deliveryAddress', deliveryAddress);

    startTransition(async () => {
      const res = await createRegistryAction(fd);
      if (!res.ok) {
        setError(res.error);
        if (res.code === 'SLUG_TAKEN') {
          setSlugState('taken');
          setStep(0);
        }
        return;
      }
      router.replace(`/dashboard/registry/${res.data.id}/customize`);
      router.refresh();
    });
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Hediye listeni oluştur</CardTitle>
        <CardDescription>Adım {step + 1} / {STEPS.length} · {STEPS[step]}</CardDescription>
        <div className="mt-3 flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-blush-500' : 'bg-blush-100'}`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 0 && (
          <>
            <div>
              <Label htmlFor="title">Liste başlığı</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={onTitleBlur}
                placeholder="Ayşe & Mehmet'in Düğünü"
              />
            </div>
            <div>
              <Label htmlFor="weddingDate">Düğün tarihi</Label>
              <Input
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Mekan (opsiyonel)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="İstanbul"
              />
            </div>
            <div>
              <Label htmlFor="slug">Liste bağlantısı</Label>
              <div className="flex items-center gap-1 text-sm text-ink-soft">
                <span>hediyola.com/list/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    const v = slugify(e.target.value);
                    setSlug(v);
                    setSlugState('idle');
                  }}
                  onBlur={() => verifySlug(slug)}
                  className="flex-1"
                  placeholder="ayse-mehmet"
                />
              </div>
              <SlugHint state={slugState} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <label className="flex items-center gap-3 rounded-xl border border-blush-100 p-4">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 accent-blush-500"
              />
              <span>
                <span className="block font-medium text-ink">Özel liste</span>
                <span className="text-sm text-ink-soft">
                  Yalnızca parolayı bilen misafirler listeyi görebilir.
                </span>
              </span>
            </label>
            {isPrivate && (
              <div>
                <Label htmlFor="passcode">Liste parolası</Label>
                <Input
                  id="passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  minLength={LIMITS.passcodeMinLength}
                  placeholder="En az 4 karakter"
                />
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <div>
            <Label htmlFor="deliveryAddress">Kargo adresi (misafirlerden gizli)</Label>
            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={4}
              className="flex w-full rounded-xl border border-blush-100 bg-white px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-500"
              placeholder="Fiziksel hediyelerin gönderileceği adres"
            />
            <p className="mt-1 text-xs text-ink-soft">
              Bu adres misafirlere asla gösterilmez; yalnızca kargo için kullanılır.
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-blush-50 px-3 py-2 text-sm text-blush-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || pending}
          >
            Geri
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !canProceedStep0()) || (step === 1 && !canProceedStep1())}
            >
              Devam
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? 'Oluşturuluyor…' : 'Listeyi oluştur'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SlugHint({ state }: { state: SlugState }) {
  if (state === 'idle') return null;
  if (state === 'checking')
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
        <Loader2 className="h-3 w-3 animate-spin" /> Kontrol ediliyor…
      </p>
    );
  if (state === 'available')
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-olive-600">
        <Check className="h-3 w-3" /> Bu bağlantı uygun
      </p>
    );
  if (state === 'taken')
    return <p className="mt-1 text-xs text-blush-700">Bu bağlantı alınmış, başka bir tane dene.</p>;
  return <p className="mt-1 text-xs text-blush-700">Geçersiz bağlantı adı.</p>;
}
