'use client';

import { Suspense } from 'react';
import AuthCallbackClient from './client';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Verifying your session…</main>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
