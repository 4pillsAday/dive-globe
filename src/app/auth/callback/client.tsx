'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AuthCallbackClient() {
  const [text, setText] = useState('Verifying your session…');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // The browser client parses the URL hash and stores the session automatically.
    // We just check whether a session exists and then redirect.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setText('Signed in! Redirecting…');
        const redirectTo = searchParams.get('redirect_to');
        router.replace(redirectTo || '/');
      } else {
        setText('No session found. Try logging in again.');
      }
    })();
  }, [router, searchParams]);

  return <main style={{ padding: 24 }}>{text}</main>;
}
