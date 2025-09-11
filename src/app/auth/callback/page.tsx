'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const [text, setText] = useState('Verifying your session…');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClientComponentClient();
    // The browser client parses the URL hash and stores the session automatically.
    // We just check whether a session exists and then redirect.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setText('Signed in! Redirecting…');
        const redirectTo = searchParams.get('redirect_to');
        router.replace(redirectTo || '/'); // change to your app's post-login route
      } else {
        setText('No session found. Try sending a new link from /login.');
      }
    })();
  }, [router, searchParams]);

  return <main style={{ padding: 24 }}>{text}</main>;
}
