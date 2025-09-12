// Utility function to completely clear all auth data
export function clearAllAuthData() {
  console.log('[Logout] Clearing all auth data...');
  
  // Clear localStorage
  localStorage.setItem('dg:isAuth', '0');
  localStorage.removeItem('sb-bjbjreskajcqlzbwnnca-auth-token');
  localStorage.removeItem('sb-bjbjreskajcqlzbwnnca-auth-token-code-verifier');
  
  // Clear all Supabase localStorage items
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear cookies
  const cookiesToClear = [
    'sb-bjbjreskajcqlzbwnnca-auth-token',
    'sb-bjbjreskajcqlzbwnnca-auth-token-code-verifier',
    // Clear chunked cookies
    ...Array.from({ length: 10 }, (_, i) => `sb-bjbjreskajcqlzbwnnca-auth-token.${i}`),
    ...Array.from({ length: 10 }, (_, i) => `sb-bjbjreskajcqlzbwnnca-auth-token-code-verifier.${i}`),
  ];
  
  cookiesToClear.forEach(cookieName => {
    // Clear with different path/domain variations to ensure removal
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/app`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.thediveglobe.com`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=thediveglobe.com`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=www.thediveglobe.com`;
  });
  
  console.log('[Logout] All auth data cleared');
}
