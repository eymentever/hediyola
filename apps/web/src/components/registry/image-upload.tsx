'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { STORAGE_BUCKETS } from '@hediyola/shared';
import { createClient } from '@/lib/supabase/client';

type BucketKey = keyof typeof STORAGE_BUCKETS;

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Image uploader → Supabase Storage. Files are written to "<userId>/<file>"
 * so storage RLS (couples_write_own_folder) permits the write. Client-side
 * type/size checks mirror server expectations; the bucket policy is the real
 * gate.
 */
export function ImageUpload({
  bucket,
  userId,
  value,
  onChange,
  label,
  rounded = false,
}: {
  bucket: BucketKey;
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  rounded?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError('Yalnızca JPG, PNG veya WEBP yükleyebilirsin.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Dosya en fazla 5 MB olabilir.');
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${bucket}-${Date.now()}.${ext}`;
    const bucketName = STORAGE_BUCKETS[bucket];

    const { error: upErr } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setError('Yükleme başarısız. Tekrar dene.');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div
        className={`relative flex items-center justify-center overflow-hidden border border-dashed border-blush-300 bg-blush-50 ${
          rounded ? 'h-28 w-28 rounded-full' : 'h-40 w-full rounded-2xl'
        }`}
      >
        {value ? (
          <>
            <Image src={value} alt={label} fill className="object-cover" sizes="400px" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-ink shadow"
              aria-label="Görseli kaldır"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-blush-700"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
            <span className="text-xs">{uploading ? 'Yükleniyor…' : 'Görsel seç'}</span>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-blush-700">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
    </div>
  );
}
