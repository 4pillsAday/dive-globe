import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Create response
  const response = NextResponse.json({ success: true });
  
  // Clear all auth-related cookies
  const cookiesToClear = [
    'sb-bjbjreskajcqlzbwnnca-auth-token',
    'sb-bjbjreskajcqlzbwnnca-auth-token-code-verifier',
    // Clear chunked cookies
    ...Array.from({ length: 10 }, (_, i) => `sb-bjbjreskajcqlzbwnnca-auth-token.${i}`),
    ...Array.from({ length: 10 }, (_, i) => `sb-bjbjreskajcqlzbwnnca-auth-token-code-verifier.${i}`),
  ];
  
  cookiesToClear.forEach(cookieName => {
    response.cookies.set({
      name: cookieName,
      value: '',
      path: '/',
      expires: new Date(0),
      sameSite: 'lax',
      secure: true,
    });
  });
  
  return response;
}
