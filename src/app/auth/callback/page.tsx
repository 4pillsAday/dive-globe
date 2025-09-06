'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const [text, setText] = useState('Verifying your session…');
  const router = useRouter();

  useEffect(() => {
    // The browser client parses the URL hash and stores the session automatically.
    // We just check whether a session exists and then redirect.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setText('Signed in! Redirecting…');
        router.replace('/'); // change to your app's post-login route
      } else {
        setText('No session found. Try sending a new link from /login.');
      }
    })();
  }, [router]);

  return <main style={{ padding: 24 }}>{text}</main>;
}
