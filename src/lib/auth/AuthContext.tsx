'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

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
      console.log('[AuthContext] window.supabase exists:', !!window.supabase);
      console.log('[AuthContext] localStorage dg:isAuth:', typeof window !== 'undefined' ? localStorage.getItem('dg:isAuth') : 'N/A');
      
      // Wait for window.supabase to be available (from Webflow)
      let retries = 0;
      const maxRetries = 20; // Wait up to 2 seconds
      
      while (!window.supabase && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      console.log('[AuthContext] After waiting, window.supabase exists:', !!window.supabase);
      console.log('[AuthContext] Waited for', retries * 100, 'ms');

      if (!window.supabase) {
        console.warn('[AuthContext] window.supabase not found after waiting, auth may not work properly');
        setIsLoading(false);
        return;
      }

      try {
        // Get the current session from the global Supabase instance
        console.log('[AuthContext] Getting session from window.supabase...');
        const { data: { session: currentSession }, error } = await window.supabase.auth.getSession();
        
        console.log('[AuthContext] Session result:', {
          hasSession: !!currentSession,
          sessionUser: currentSession?.user?.email,
          error: error
        });
        
        setSession(currentSession);
        
        // Set up listener for auth changes
        console.log('[AuthContext] Setting up auth state change listener...');
        const { data: { subscription: authSubscription } } = window.supabase.auth.onAuthStateChange((event, session) => {
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
