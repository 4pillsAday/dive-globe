import { createBrowserClient } from '@supabase/ssr';

// Create a Supabase client that works with cookies
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        
        // Try to get the main cookie
        const cookies = document.cookie.split('; ');
        const mainCookie = cookies.find(row => row.startsWith(`${name}=`));
        if (mainCookie) {
          return mainCookie.split('=')[1];
        }
        
        // If not found, try to reconstruct from chunks (Supabase sometimes chunks large tokens)
        const chunks: string[] = [];
        for (let i = 0; i < 10; i++) {
          const chunk = cookies.find(row => row.startsWith(`${name}.${i}=`));
          if (chunk) {
            chunks.push(chunk.split('=')[1]);
          } else {
            break;
          }
        }
        
        if (chunks.length > 0) {
          return chunks.join('');
        }
        
        return undefined;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      set(_name: string, _value: string, _options: any) {
        if (typeof document === 'undefined') return;
        // Let Supabase handle cookie setting through its auth methods
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      remove(_name: string, _options: any) {
        if (typeof document === 'undefined') return;
        // Let Supabase handle cookie removal through its auth methods
      },
    },
  }
);

export default supabase;
