import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a singleton that uses window.supabase if available (from Webflow),
// otherwise creates its own instance for local development
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: SupabaseClient<any, any, any> | null = null;

function getSupabaseClient() {
  // Return cached instance if available
  if (supabase) {
    return supabase;
  }

  // Only run on client side
  if (typeof window === 'undefined') {
    console.log('[supabaseClient] Running on server, returning null');
    return null;
  }

  console.log('[supabaseClient] Getting Supabase client...');
  console.log('[supabaseClient] window.supabase exists:', !!window.supabase);

  if (window.supabase) {
    // Use the global Supabase instance from Webflow
    console.log('[supabaseClient] Using window.supabase from Webflow');
    supabase = window.supabase;
  } else {
    // Create our own instance for local development or when not in Webflow context
    console.log('[supabaseClient] Creating new Supabase client instance');
    console.log('[supabaseClient] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as SupabaseClient<any, any, any>;
  }

  return supabase;
}

// Export a proxy that lazily gets the client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseProxy = new Proxy({} as SupabaseClient<any, any, any>, {
  get(target, prop, receiver) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not available on server side');
    }
    return Reflect.get(client, prop, receiver);
  }
});

export default supabaseProxy;
