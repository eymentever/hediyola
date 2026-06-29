# ============================================================
# Hediyola - Windows kurulum scripti (PowerShell)
# Kullanim:  Sag tik > "PowerShell ile calistir"  veya
#            terminalde:  ./setup.ps1
# ============================================================
$ErrorActionPreference = "Stop"

Write-Host "Hediyola kurulum baslatiliyor..." -ForegroundColor Magenta

# 1) Node surumu kontrol
try {
  $nodeVersion = node -v
  Write-Host "Node bulundu: $nodeVersion" -ForegroundColor Green
} catch {
  Write-Host "Node.js bulunamadi. Lutfen https://nodejs.org adresinden 18.18+ kur." -ForegroundColor Red
  exit 1
}

# 2) Bagimliliklari kur
Write-Host "`nBagimliliklar kuruluyor (npm install)..." -ForegroundColor Cyan
npm install

# 3) .env dosyasi
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "`n.env olusturuldu. ANAHTARLARI DOLDURMAYI UNUTMA (Supabase, Stripe, Iyzico, Resend)." -ForegroundColor Yellow
} else {
  Write-Host "`n.env zaten var, atlandi." -ForegroundColor Green
}

# 4) Prisma client uret
Write-Host "`nPrisma client uretiliyor..." -ForegroundColor Cyan
npm run db:generate

Write-Host "`n----------------------------------------------------" -ForegroundColor Magenta
Write-Host "Kurulum tamam. Sirada:" -ForegroundColor Magenta
Write-Host "  1) .env dosyasini Supabase/Stripe/Iyzico anahtarlarinla doldur"
Write-Host "  2) Supabase SQL editorunde sirayla calistir:"
Write-Host "       packages/db/prisma/policies.sql"
Write-Host "       packages/db/prisma/storage.sql"
Write-Host "     (once 'npm run db:push' ile semayi gonder)"
Write-Host "  3) Siteyi baslat:  npm run web   ->  http://localhost:3000"
Write-Host "  4) Mobil:          npm run mobile"
Write-Host "Detaylar icin SETUP.md dosyasina bak." -ForegroundColor Magenta
