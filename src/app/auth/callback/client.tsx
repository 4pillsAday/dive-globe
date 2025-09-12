'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackClient() {
  const [text, setText] = useState('Verifying your session…');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      // Ensure the client exists before trying to use it.
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
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
