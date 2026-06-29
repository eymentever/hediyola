import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/profile-form';

export const metadata: Metadata = { title: 'Profil' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user!.id)
    .single();

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Profil ayarları</CardTitle>
          <CardDescription>Adını ve iletişim bilgilerini güncelle.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialName={profile?.full_name ?? ''}
            email={profile?.email ?? user!.email ?? ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
