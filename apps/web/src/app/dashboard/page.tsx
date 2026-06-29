import Link from 'next/link';
import { Gift, Plus, User, Settings, ExternalLink, ShieldAlert } from 'lucide-react';
import { ROUTES, formatDate } from '@hediyola/shared';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Shown when Supabase is not yet configured or user is not logged in. */
function DashboardPlaceholder() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Merhaba, Misafir 👋</h1>
        <p className="mt-1 text-ink-soft">Düğün hediye listeni buradan yönet.</p>
      </div>

      <Card className="border-dashed border-blush-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-ink">
            <ShieldAlert className="h-5 w-5 text-blush-500" /> Platform Kurulum Modu
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
            <Button asChild>
              <Link href="/onboarding">Örnek Liste Oluştur (Demo)</Link>
            </Button>
            <Button variant="outline" asChild>
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">Merhaba, {displayName} 👋</h1>
            <p className="mt-1 text-ink-soft">Düğün hediye listeni buradan yönet.</p>
          </div>
          {hasRegistries && (
            <Button asChild>
              <Link href="/onboarding">
                <Plus className="h-4 w-4" /> Yeni liste
              </Link>
            </Button>
          )}
        </div>

        {!hasRegistries ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Gift className="h-5 w-5 text-blush-500" /> Henüz bir listen yok
              </CardTitle>
              <CardDescription>
                İlk hediye listeni oluşturarak başla. Birkaç adımda hazır olur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/onboarding">
                  <Plus className="h-4 w-4" /> Liste oluştur
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {registries!.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5 text-blush-500" /> {r.title}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(r.wedding_date)} · {r.status === 'ACTIVE' ? 'Yayında' : 'Taslak'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/registry/${r.id}/items`}>
                      <Gift className="h-4 w-4" /> Hediyeler
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/registry/${r.id}/customize`}>
                      <Settings className="h-4 w-4" /> Görünüm
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={ROUTES.registry(r.slug)} target="_blank">
                      <ExternalLink className="h-4 w-4" /> Önizle
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-blush-500" /> Profil
            </CardTitle>
            <CardDescription>İletişim bilgilerini güncel tut.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-ink-soft">
            <p>
              <span className="text-ink">Ad:</span> {profile?.full_name ?? '—'}
            </p>
            <p>
              <span className="text-ink">E-posta:</span> {profile?.email ?? user.email}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/profile">Profili düzenle</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    return <DashboardPlaceholder />;
  }
}
