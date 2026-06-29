'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteProductAction } from '@/lib/admin/product-actions';

/** Delete a product with an inline confirm step (no native dialogs). */
export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function onDelete() {
    setPending(true);
    try {
      const res = await deleteProductAction(productId);
      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      }
    } catch {
      // Ignore errors or handle gracefully
    } finally {
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" /> Sil
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-soft">Emin misin?</span>
      <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
        Vazgeç
      </Button>
      <Button type="button" size="sm" onClick={onDelete} disabled={pending}>
        {pending ? 'Siliniyor…' : 'Evet, sil'}
      </Button>
    </div>
  );
}
