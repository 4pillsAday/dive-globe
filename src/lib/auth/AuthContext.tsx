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
      // Wait for window.supabase to be available (from Webflow)
      let retries = 0;
      const maxRetries = 20; // Wait up to 2 seconds
      
      while (!window.supabase && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.supabase) {
        console.warn('window.supabase not found, auth may not work properly');
        setIsLoading(false);
        return;
      }

      try {
        // Get the current session from the global Supabase instance
        const { data: { session: currentSession } } = await window.supabase.auth.getSession();
        setSession(currentSession);
        
        // Set up listener for auth changes
        const { data: { subscription: authSubscription } } = window.supabase.auth.onAuthStateChange((_event, session) => {
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
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
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
