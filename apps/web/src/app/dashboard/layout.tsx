import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Protected dashboard shell. Middleware also guards /dashboard, but we re-check
 * here (defense in depth) so a missing session can never render private data.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard');

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-blush-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-serif text-xl font-bold text-blush-500">
            Hediyola
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
              Panel
            </NavLink>
            <NavLink href="/dashboard/profile" icon={<User className="h-4 w-4" />}>
              Profil
            </NavLink>
            <form action="/auth/signout" method="post">
              <button className="ml-2 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-blush-50">
                Çıkış
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-blush-50"
    >
      {icon}
      {children}
    </Link>
  );
}
