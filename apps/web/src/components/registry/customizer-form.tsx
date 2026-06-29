'use client';

import { useState, useTransition } from 'react';
import { daysUntil, formatDate, LIMITS } from '@hediyola/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from './image-upload';
import { updateCustomizationAction } from '@/lib/registry/actions';

interface InitialData {
  story: string | null;
  location: string | null;
  coverImage: string | null;
  avatarImage: string | null;
  weddingDate: string;
}

/** Customizer form: love story, images, location + live countdown preview. */
export function CustomizerForm({
  registryId,
  userId,
  initial,
}: {
  registryId: string;
  userId: string;
  initial: InitialData;
}) {
  const [story, setStory] = useState(initial.story ?? '');
  const [location, setLocation] = useState(initial.location ?? '');
  const [coverImage, setCoverImage] = useState<string | null>(initial.coverImage);
  const [avatarImage, setAvatarImage] = useState<string | null>(initial.avatarImage);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const days = daysUntil(initial.weddingDate);

  function save() {
    setMessage(null);
    const fd = new FormData();
    fd.set('story', story);
    fd.set('location', location);
    if (coverImage) fd.set('coverImage', coverImage);
    if (avatarImage) fd.set('avatarImage', avatarImage);

    startTransition(async () => {
      const res = await updateCustomizationAction(registryId, fd);
      setMessage(
        res.ok
          ? { type: 'ok', text: 'Kaydedildi.' }
          : { type: 'err', text: res.error },
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* Countdown preview */}
      <div className="rounded-2xl bg-champagne px-5 py-4 text-center">
        <p className="text-sm text-olive-600">Düğüne kalan</p>
        <p className="font-serif text-3xl font-bold text-ink">
          {days > 0 ? `${days} gün` : days === 0 ? 'Bugün!' : 'Gerçekleşti'}
        </p>
        <p className="text-sm text-ink-soft">{formatDate(initial.weddingDate)}</p>
      </div>

      <ImageUpload
        bucket="registryCovers"
        userId={userId}
        value={coverImage}
        onChange={setCoverImage}
        label="Kapak fotoğrafı"
      />
      <ImageUpload
        bucket="registryAvatars"
        userId={userId}
        value={avatarImage}
        onChange={setAvatarImage}
        label="Profil görseli"
        rounded
      />

      <div>
        <Label htmlFor="location">Mekan</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="story">Aşk hikayeniz</Label>
        <textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={6}
          maxLength={LIMITS.storyMaxLength}
          className="flex w-full rounded-xl border border-blush-100 bg-white px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-500"
          placeholder="Nasıl tanıştınız? Misafirlerinizle hikayenizi paylaşın…"
        />
        <p className="mt-1 text-right text-xs text-ink-soft">
          {story.length}/{LIMITS.storyMaxLength}
        </p>
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

      <Button type="button" onClick={save} disabled={pending}>
        {pending ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
      </Button>
    </div>
  );
}
