/**
 * POST /api/products/scrape — fetch basic product metadata (title, image,
 * price) from a user-supplied URL so couples can add custom items.
 *
 * Hardened per SECURITY.md §4:
 *  - Authentication required.
 *  - Rate limited per IP.
 *  - https-only (Zod) and SSRF-checked (DNS resolution + private-range block).
 *  - Redirects rejected (a redirect could point back to an internal host).
 *  - Response capped (time + size) and limited to text/html.
 *  - Output sanitized before returning.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { scrapeUrlSchema } from '@hediyola/shared';
import { requireUser } from '@/lib/auth/guards';
import { getClientIp } from '@/lib/security/request';
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { assertSafeHost } from '@/lib/security/ssrf';

const MAX_BYTES = 1_000_000; // 1 MB cap
const TIMEOUT_MS = 6000;

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: 'Yetkisiz.' }, { status: 401 });
  }

  const ip = await getClientIp();
  const limit = rateLimit(`scrape:${ip}`, RATE_LIMITS.scraper.limit, RATE_LIMITS.scraper.windowMs);
  if (!limit.success) {
    return NextResponse.json({ ok: false, error: 'Çok fazla istek.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Geçersiz istek.' }, { status: 400 });
  }

  const parsed = scrapeUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Yalnızca https bağlantıları.' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(parsed.data.url);
    await assertSafeHost(target.hostname); // SSRF guard
  } catch {
    return NextResponse.json({ ok: false, error: 'Bu bağlantı getirilemez.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(target, {
      method: 'GET',
      redirect: 'error', // do not follow redirects (SSRF safety)
      signal: controller.signal,
      headers: { 'user-agent': 'HediyolaBot/1.0 (+https://hediyola.com)' },
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.includes('text/html')) {
      return NextResponse.json({ ok: false, error: 'Sayfa okunamadı.' }, { status: 400 });
    }

    // Read at most MAX_BYTES from the stream.
    const reader = res.body?.getReader();
    if (!reader) return NextResponse.json({ ok: false, error: 'Boş yanıt.' }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.length;
        if (total > MAX_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');

    return NextResponse.json({ ok: true, data: extractMeta(html) });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bağlantı getirilemedi.' }, { status: 400 });
  } finally {
    clearTimeout(timer);
  }
}

/** Extract og:title / og:image / price via lightweight regex (no deps). */
function extractMeta(html: string): {
  title: string | null;
  imageUrl: string | null;
  price: number | null;
} {
  const meta = (prop: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      'i',
    );
    return html.match(re)?.[1] ?? null;
  };

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null;
  const title = sanitize(meta('og:title') ?? titleTag);
  const imageRaw = meta('og:image');
  const imageUrl = imageRaw && /^https:\/\//.test(imageRaw) ? imageRaw : null;

  const priceRaw = meta('product:price:amount') ?? meta('og:price:amount') ?? meta('twitter:data1');
  const priceNum = priceRaw ? Number(priceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) : NaN;
  const price = Number.isFinite(priceNum) && priceNum > 0 ? Math.round(priceNum * 100) / 100 : null;

  return { title, imageUrl, price };
}

/** Strip tags and control characters, then clamp length, from scraped text. */
function sanitize(value: string | null): string | null {
  if (!value) return null;
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\p{Cc}/gu, '')
    .trim()
    .slice(0, 200);
}
