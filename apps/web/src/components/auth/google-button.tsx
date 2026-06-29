'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

/** Google OAuth sign-in. Redirects through Supabase to /auth/callback. */
export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) setLoading(false);
  }

  return (
    <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleGoogle}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.24 10.4V14h5.07c-.22 1.18-.9 2.18-1.92 2.85v2.37h3.1c1.81-1.67 2.86-4.13 2.86-7.06 0-.66-.06-1.3-.17-1.91h-9z"
        />
        <path
          fill="currentColor"
          d="M12.24 21c2.43 0 4.47-.8 5.96-2.18l-3.1-2.37c-.86.58-1.96.92-2.86.92-2.2 0-4.06-1.49-4.73-3.49H4.3v2.45A8.99 8.99 0 0 0 12.24 21z"
        />
        <path
          fill="currentColor"
          d="M7.51 13.88a5.4 5.4 0 0 1 0-3.46V7.97H4.3a9 9 0 0 0 0 8.06l3.21-2.15z"
        />
        <path
          fill="currentColor"
          d="M12.24 6.93c1.32 0 2.5.45 3.43 1.35l2.57-2.57C16.7 4.24 14.66 3.4 12.24 3.4A8.99 8.99 0 0 0 4.3 7.97l3.21 2.45c.67-2 2.53-3.49 4.73-3.49z"
        />
      </svg>
      Google ile devam et
    </Button>
  );
}
