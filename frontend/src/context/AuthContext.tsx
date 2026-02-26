import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { signIn as doSignIn, signUp as doSignUp, restoreSession, logout as doLogout } from '../services/auth';
import { setAuthToken } from '../services/api';
import { supabase } from '../services/supabase';

interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession()
      .then((result) => {
        if (result) setUserId(result.userId);
      })
      .catch(() => {
        doLogout();
        setUserId(null);
      })
      .finally(() => setIsLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthToken(session?.access_token ?? null);
        setUserId(session?.user?.id ?? null);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await doSignIn(email, password);
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id ?? null);
  };

  const signUp = async (email: string, password: string) => {
    await doSignUp(email, password);
  };

  const logout = () => {
    doLogout();
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated: !!userId, isLoading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
