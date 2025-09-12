'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sent'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  const sendMagicLink = async () => {
    // Ensure the client exists before trying to use it.
    if (!supabase) return;

    setStatus('idle'); setMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setStatus('error'); setMsg(error.message); }
    else { setStatus('sent'); setMsg('Check your inbox for a sign-in link.'); }
  };

  return (
    <main style={{ maxWidth: 420, margin: '48px auto', display: 'grid', gap: 12 }}>
      <h1>Email sign-in</h1>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={sendMagicLink} style={{ padding: 10, borderRadius: 8 }}>
        Send magic link
      </button>
      {status !== 'idle' && <p style={{ color: status === 'error' ? 'crimson' : 'inherit' }}>{msg}</p>}
    </main>
  );
}
