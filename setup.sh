#!/usr/bin/env bash
# ============================================================
# Hediyola - kurulum scripti (macOS / Linux / Git Bash)
# Kullanim:  bash setup.sh
# ============================================================
set -euo pipefail

echo "Hediyola kurulum baslatiliyor..."

# 1) Node kontrol
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js bulunamadi. https://nodejs.org adresinden 18.18+ kur."
  exit 1
fi
echo "Node bulundu: $(node -v)"

# 2) Bagimliliklar
echo ""
echo "Bagimliliklar kuruluyor (npm install)..."
npm install

# 3) .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo ".env olusturuldu. ANAHTARLARI DOLDURMAYI UNUTMA (Supabase, Stripe, Iyzico, Resend)."
else
  echo ".env zaten var, atlandi."
fi

# 4) Prisma
echo ""
echo "Prisma client uretiliyor..."
npm run db:generate

cat <<'EOF'

----------------------------------------------------
Kurulum tamam. Sirada:
  1) .env dosyasini anahtarlarinla doldur
  2) Supabase SQL editorunde sirayla calistir:
       packages/db/prisma/policies.sql
       packages/db/prisma/storage.sql
     (once 'npm run db:push' ile semayi gonder)
  3) Siteyi baslat:  npm run web   ->  http://localhost:3000
  4) Mobil:          npm run mobile
Detaylar icin SETUP.md dosyasina bak.
EOF
