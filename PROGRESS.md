# Hediyola — Geliştirme Durumu

Son güncelleme: 29 Haziran 2026. Konum: `Masaüstü\hediyola_project`.

## Şu ana kadar tamamlananlar

| Faz | Kapsam | Durum |
| --- | --- | --- |
| 1 | Monorepo, 4 paket, Prisma şeması, Supabase bağlantıları | ✅ |
| 2 | Kimlik doğrulama (e-posta + Google), profil paneli, mobil giriş | ✅ |
| 3 | Liste oluşturma sihirbazı + özelleştirme + görsel yükleme | ✅ |
| 4 | Admin ürün yönetimi, katalog/fon/özel ekleme, güvenli scraper | ✅ |
| + | Dayanıklılık katmanı (hata/404/loading sınırları) | ✅ |
| 5 | Misafir portalı + sepet (`/list/[slug]`) | ⏳ sırada |
| 6 | Ödeme (Stripe + Iyzico) | ⏳ |
| 7 | Panolar + ödeme talebi | ⏳ |
| 8 | Mobil (barkod, bildirim) | ⏳ |
| 9 | Test, optimizasyon, deploy | ⏳ |

## Uygulama şu an ne yapabiliyor?

- Çift kayıt olur / giriş yapar (e-posta-parola veya Google).
- Çok adımlı sihirbazla düğün listesi oluşturur (tarih, mekan, özel bağlantı `hediyola.com/list/...`, gizli/parolalı seçeneği, kargo adresi).
- Listesini özelleştirir: aşk hikayesi, geri sayım, kapak ve profil görseli.
- Listesine hediye ekler: katalogdan ürün, balayı/nakit fonu, veya dış siteden link yapıştırarak özel ürün.
- Admin, ürün kataloğunu yönetir (ekle/düzenle/sil).
- Mobil uygulamada giriş yapıp özet ekranı görür.

> Misafirlerin listeyi görüp hediye alması ve ödeme **Phase 5-6**'da gelecek.

## Nasıl kontrol edersin?

1. Kurulum: kök klasörde `./setup.ps1` (Windows) — bkz. `SETUP.md`.
2. `.env` doldur → `npm run db:push` → Supabase SQL editöründe `policies.sql` ve `storage.sql` çalıştır.
3. `npm run web` → `http://localhost:3000`.
4. Manuel test akışı:
   - `/signup` → kayıt ol → e-postanı doğrula → `/login`.
   - `/dashboard` → "Liste oluştur" → sihirbazı tamamla.
   - "Görünüm" → görsel yükle, hikaye yaz, kaydet.
   - "Hediyeler" → katalogdan ekle / fon oluştur / link yapıştır.
   - Admin için: Supabase'de profilinin `role` alanını `ADMIN` yap → `/admin/products`.
5. Sağlık kontrolü: `http://localhost:3000/api/health` → `{"status":"ok"}`.

## Sistem nasıl kuruldu? (mimari)

- **Monorepo (Turborepo + npm workspaces):** `apps/web` (Next.js 14), `apps/mobile` (Expo), `packages/shared` (tipler + Zod), `packages/db` (Prisma + Supabase), `packages/config`.
- **Veritabanı:** Supabase PostgreSQL; Prisma ile şema. Her tabloda satır-düzeyi güvenlik (RLS).
- **Kimlik:** Supabase Auth; oturum httpOnly çerezde; mobilde şifreli SecureStore.
- **Güvenlik (maksimum):** deny-by-default RLS, service-role anahtarı yalnızca sunucu, her girdide Zod doğrulama, rate limiting, scrypt parola hash'i, SSRF korumalı scraper, sunucu-otoriter fiyatlar.
- **Dayanıklılık:** hata sınırları (asla beyaz ekran), 404 ve loading sayfaları.
- **UI:** TailwindCSS + Shadcn, Playfair + Inter, blush/gold/şampanya pastel tema.

## Doğrulama notu
73 kaynak dosyanın tamamı sözdizimi denetiminden geçti; `packages/shared` strict TypeScript'ten temiz; güvenlik denetimleri tamam. (Tam tip kontrolü ve canlı çalıştırma, `npm install` sonrası senin makinende yapılır — sandbox'ta ağ kısıtı var.)
