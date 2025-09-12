'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    const initAuth = async () => {
      console.log('[AuthContext] Starting auth initialization...');
      console.log('[AuthContext] localStorage dg:isAuth:', typeof window !== 'undefined' ? localStorage.getItem('dg:isAuth') : 'N/A');
      console.log('[AuthContext] All cookies:', document.cookie);
      console.log('[AuthContext] Location:', window.location.pathname);
      
      // Create a Supabase client that reads from cookies
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              // Try to get the main cookie
              const cookies = document.cookie.split('; ');
              const mainCookie = cookies.find(row => row.startsWith(`${name}=`));
              if (mainCookie) {
                console.log(`[AuthContext] Found cookie ${name}`);
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
                console.log(`[AuthContext] Found chunked cookie ${name} with ${chunks.length} chunks`);
                return chunks.join('');
              }
              
              console.log(`[AuthContext] Cookie ${name} not found`);
              return undefined;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            set(name: string, _value: string, _options: any) {
              console.log(`[AuthContext] Setting cookie ${name}`);
              // Let Supabase handle cookie setting
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            remove(name: string, _options: any) {
              console.log(`[AuthContext] Removing cookie ${name}`);
              // Let Supabase handle cookie removal
            },
          },
        }
      );

      try {
        // Get the current session from cookies
        console.log('[AuthContext] Getting session from cookies...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        console.log('[AuthContext] Session result:', {
          hasSession: !!currentSession,
          sessionUser: currentSession?.user?.email,
          error: error
        });
        
        setSession(currentSession);
        
        // Set up listener for auth changes
        console.log('[AuthContext] Setting up auth state change listener...');
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('[AuthContext] Auth state changed:', {
            event,
            hasSession: !!session,
            sessionUser: session?.user?.email
          });
          
          setSession(session);
          
          // Sync with localStorage to match Webflow's auth state
          if (session) {
            localStorage.setItem('dg:isAuth', '1');
          } else {
            localStorage.setItem('dg:isAuth', '0');
          }
        });
        
        subscription = authSubscription;
        
        // Also store the client for global access if needed
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).nextSupabase = supabase;
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        console.log('[AuthContext] Auth initialization complete');
      }
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
