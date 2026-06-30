import Link from 'next/link';
import { Gift, Plus, User, Settings, ExternalLink, ShieldAlert } from 'lucide-react';
import { ROUTES, formatDate } from '@hediyola/shared';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegistryQrCode } from '@/components/registry/registry-qrcode';

/** Shown when Supabase is not yet configured or user is not logged in. */
function DashboardPlaceholder() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Merhaba, Misafir 👋</h1>
        <p className="mt-1 text-ink-soft">Düğün hediye listenizi buradan yönetin.</p>
      </div>

      <Card className="border-dashed border-gold-500/30 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-ink font-serif">
            <ShieldAlert className="h-5 w-5 text-gold-500" /> Platform Kurulum Modu
          </CardTitle>
          <CardDescription>
            Supabase bağlantısı henüz yapılandırılmadığı için şu an bir kullanıcı girişi yapılamıyor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ink-soft">
            Veritabanı kurulduğunda burada kendi hediye listenizi oluşturup yönetebileceksiniz.
          </p>
          <div className="flex gap-4">
            <Button asChild className="bg-ink hover:bg-ink-soft text-white">
              <Link href="/onboarding">Örnek Liste Oluştur (Demo)</Link>
            </Button>
            <Button variant="outline" asChild className="border-ink/10 text-ink">
              <Link href="/search">Misafir Olarak Ara</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Couple dashboard home. Reads the signed-in user's profile and registries via
 * RLS (only ever the caller's own rows). Stats & purchase feed arrive in Phase 7.
 */
export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <DashboardPlaceholder />;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return <DashboardPlaceholder />;
    }

    // RLS guarantees these only ever return the caller's own rows.
    const [{ data: profile }, { data: registries }] = await Promise.all([
      supabase.from('profiles').select('full_name, email, role').eq('id', user.id).single(),
      supabase
        .from('registries')
        .select('id, title, slug, wedding_date, status')
        .eq('couple_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    const displayName = profile?.full_name ?? user.email;
    const hasRegistries = (registries?.length ?? 0) > 0;

    return (
      <div className="space-y-8 selection:bg-gold-300 selection:text-ink">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">Merhaba, {displayName} 👋</h1>
            <p className="mt-1 text-ink-soft">Düğün hediye listenizi buradan yönetin.</p>
          </div>
          {hasRegistries && (
            <Button asChild className="bg-ink hover:bg-ink-soft text-white">
              <Link href="/onboarding">
                <Plus className="h-4 w-4 mr-1" /> Yeni Liste
              </Link>
            </Button>
          )}
        </div>

        {!hasRegistries ? (
          <Card className="bg-white border-ink/5 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif text-ink">
                <Gift className="h-5 w-5 text-gold-500" /> Henüz bir listeniz yok
              </CardTitle>
              <CardDescription>
                İlk hediye listenizi oluşturarak başlayın. Birkaç adımda hazır olur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-ink hover:bg-ink-soft text-white">
                <Link href="/onboarding">
                  <Plus className="h-4 w-4 mr-1" /> Liste Oluştur
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {registries!.map((r) => (
              <Card key={r.id} className="bg-white border-ink/5 shadow-soft flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-serif text-ink">
                    <Gift className="h-5 w-5 text-gold-500" /> {r.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(r.wedding_date)} · {r.status === 'ACTIVE' ? 'Yayında' : 'Taslak'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" className="bg-ink hover:bg-ink-soft text-white">
                      <Link href={`/dashboard/registry/${r.id}/items`}>
                        <Gift className="h-4 w-4 mr-1" /> Hediyeler
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-ink/10 text-ink">
                      <Link href={`/dashboard/registry/${r.id}/customize`}>
                        <Settings className="h-4 w-4 mr-1" /> Görünüm
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="text-ink-soft hover:text-ink">
                      <Link href={ROUTES.registry(r.slug)} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-1" /> Önizle
                      </Link>
                    </Button>
                  </div>
                  
                  {/* QR code generator modal launcher */}
                  <div className="pt-2 border-t border-ink/5 flex justify-end">
                    <RegistryQrCode slug={r.slug} title={r.title} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-white border-ink/5 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-serif text-ink">
              <User className="h-5 w-5 text-gold-500" /> Profil
            </CardTitle>
            <CardDescription>İletişim bilgilerinizi güncel tutun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-ink-soft">
            <p>
              <span className="font-semibold text-ink">Ad Soyad:</span> {profile?.full_name ?? '—'}
            </p>
            <p>
              <span className="font-semibold text-ink">E-posta:</span> {profile?.email ?? user.email}
            </p>
            <Button asChild variant="outline" className="mt-4 border-ink/10 text-ink">
              <Link href="/dashboard/profile">Profili Düzenle</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    return <DashboardPlaceholder />;
  }
}
