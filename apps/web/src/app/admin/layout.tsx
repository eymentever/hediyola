import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, LayoutDashboard } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

/**
 * Admin shell. Access is gated on the DB role (ADMIN); non-admins are bounced.
 * RLS independently blocks any admin-only data even if this check were bypassed.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-serif text-xl font-bold">
            Hediyola <span className="text-gold-500">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/admin/products" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-white/10">
              <Package className="h-4 w-4" /> Ürünler
            </Link>
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-white/10">
              <LayoutDashboard className="h-4 w-4" /> Panele dön
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
