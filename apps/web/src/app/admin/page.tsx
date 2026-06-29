'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Admin home -> Redirects to products manager via Client Side to avoid Turbopack routing bugs in non-ASCII paths. */
export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/products');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-ink-soft animate-pulse">Yönlendiriliyorsunuz...</div>
    </div>
  );
}
