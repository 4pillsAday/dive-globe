'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackClient() {
  const [text, setText] = useState('Verifying your session…');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // The browser client parses the URL hash and stores the session automatically.
    // We just check whether a session exists and then redirect.
    (async () => {
      // Wait for window.supabase to be available
      let retries = 0;
      const maxRetries = 20; // Wait up to 2 seconds
      
      while (!window.supabase && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.supabase) {
        setText('Authentication service not available. Please try again.');
        return;
      }

      const { data: { session } } = await window.supabase.auth.getSession();
      if (session) {
        setText('Signed in! Redirecting…');
        const redirectTo = searchParams.get('redirect_to');
        router.replace(redirectTo || '/');
      } else {
        setText('No session found. Try sending a new link from /login.');
      }
    })();
  }, [router, searchParams]);

  return <main style={{ padding: 24 }}>{text}</main>;
}
