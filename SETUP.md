# Hediyola — Kurulum Rehberi

Bu rehber, projeyi sıfırdan çalışır hale getirmek için izlenecek adımları içerir.
Kod tamamen hazır; senin yapman gereken tek şey **dış servis anahtarlarını** girmek
(çünkü bunlar senin hesaplarına ait gizli bilgiler) ve **kendi bilgisayarında çalıştırmak**.

---

## 0. Gereksinimler
- Node.js 18.18+ ([nodejs.org](https://nodejs.org))
- Bir Supabase hesabı (ücretsiz) — [supabase.com](https://supabase.com)
- (Ödeme için, sonra) Stripe ve Iyzico hesapları
- (E-posta için, sonra) Resend hesabı

---

## 1. Tek komutla kurulum
Proje klasöründe:

**Windows:** `./setup.ps1`
**macOS/Linux/Git Bash:** `bash setup.sh`

Bu; `npm install` → `.env` oluşturma → `prisma generate` adımlarını otomatik yapar.

---

## 2. Supabase projesi oluştur
1. [supabase.com](https://supabase.com) → **New project**. Bir isim ve güçlü bir veritabanı parolası belirle, bölge olarak **Frankfurt (eu-central)** seç (Türkiye'ye yakın).
2. Proje açılınca **Project Settings → API** sayfasından şunları kopyala:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public` anahtarı → `NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` anahtarı → `SUPABASE_SERVICE_ROLE_KEY` (yalnızca sunucu; gizli!)
3. **Project Settings → Database → Connection string → URI**'den:
   - "Transaction" (6543, pgbouncer) → `DATABASE_URL`
   - "Session" (5432) → `DIRECT_URL`

Bu değerleri `.env` dosyasına yapıştır.

---

## 3. Veritabanını hazırla
```bash
npm run db:push          # Prisma şemasını Supabase'e gönderir
```
Sonra Supabase **SQL Editor**'de sırayla çalıştır (kopyala-yapıştır):
1. `packages/db/prisma/policies.sql`  (RLS + auth trigger)
2. `packages/db/prisma/storage.sql`   (görsel bucket'ları + politikalar)

---

## 4. Google ile giriş (opsiyonel ama önerilir)
Supabase **Authentication → Providers → Google**'ı aç, Google Cloud'dan Client ID/Secret gir.
Redirect URL: `https://<proje-ref>.supabase.co/auth/v1/callback`.

---

## 5. Çalıştır
```bash
npm run web      # http://localhost:3000
npm run mobile   # Expo (telefonda Expo Go ile)
```

---

## 6. Yayına alma (Vercel)
1. Projeyi bir GitHub deposuna gönder.
2. [vercel.com](https://vercel.com) → **Import** → repoyu seç.
3. Root: `apps/web`. Environment Variables bölümüne `.env` değerlerini gir.
4. Deploy → ardından **hediyola.com** alan adını Vercel'de Domains'e ekle.

> Güvenlik: `.env` dosyasını ASLA git'e gönderme (`.gitignore`'da hariç tutuldu).
> `service_role` ve ödeme/secret anahtarları yalnızca sunucu ortam değişkeni olarak girilir.

İstersen 2–4 ve 6. adımları **tarayıcı üzerinden birlikte** yapabiliriz; sadece giriş
yapman yeterli, gerisini ben hallederim.
