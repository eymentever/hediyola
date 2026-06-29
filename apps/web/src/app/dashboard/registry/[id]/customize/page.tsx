import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { ROUTES } from '@hediyola/shared';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomizerForm } from '@/components/registry/customizer-form';

export const metadata: Metadata = { title: 'Listeyi Özelleştir' };

export default async function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Explicit owner filter (in addition to RLS) so only the owner can edit.
  const { data: registry } = await supabase
    .from('registries')
    .select('id, title, slug, story, location, cover_image, avatar_image, wedding_date')
    .eq('id', id)
    .eq('couple_id', user!.id)
    .single();

  if (!registry) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">{registry.title}</h1>
          <p className="text-sm text-ink-soft">Listeni güzelleştir.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.registry(registry.slug)} target="_blank">
            Önizle <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Görünüm ve hikaye</CardTitle>
          <CardDescription>Kapak, profil görseli, geri sayım ve aşk hikayeniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomizerForm
            registryId={registry.id}
            userId={user!.id}
            initial={{
              story: registry.story,
              location: registry.location,
              coverImage: registry.cover_image,
              avatarImage: registry.avatar_image,
              weddingDate: registry.wedding_date,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
