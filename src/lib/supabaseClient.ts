import { createBrowserClient } from '@supabase/ssr';

// Create a Supabase client that works with cookies
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1];
        return cookieValue;
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
