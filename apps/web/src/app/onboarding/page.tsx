import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export const metadata: Metadata = { title: 'Liste Oluştur' };

/** Protected onboarding entry. Middleware also guards /onboarding. */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/onboarding');

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="mb-6 inline-block font-serif text-2xl font-bold text-blush-500">
          Hediyola
        </Link>
        <OnboardingWizard />
      </div>
    </div>
  );
}
