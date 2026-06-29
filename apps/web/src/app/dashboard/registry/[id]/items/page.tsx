import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { RegistryBuilder } from '@/components/registry/registry-builder';

export const metadata: Metadata = { title: 'Hediyeleri Yönet' };

export default async function RegistryItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ownership-checked fetch (RLS + explicit couple_id).
  const { data: registry } = await supabase
    .from('registries')
    .select('id, title')
    .eq('id', id)
    .eq('couple_id', user!.id)
    .single();

  if (!registry) notFound();

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase
      .from('registry_items')
      .select('id, type, title, price, image_url, target_amount, amount_received')
      .eq('registry_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id, brand, title, price, image_url, category')
      .eq('in_stock', true)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">{registry.title}</h1>
          <p className="text-sm text-ink-soft">Hediyelerini ekle ve düzenle.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/registry/${registry.id}/customize`}>
            <Settings className="h-4 w-4" /> Görünüm
          </Link>
        </Button>
      </div>

      <RegistryBuilder
        registryId={registry.id}
        products={(products ?? []).map((p) => ({ ...p, price: Number(p.price) }))}
        items={(items ?? []).map((it) => ({
          ...it,
          price: Number(it.price),
          target_amount: it.target_amount === null ? null : Number(it.target_amount),
          amount_received: Number(it.amount_received),
        }))}
      />
    </div>
  );
}
