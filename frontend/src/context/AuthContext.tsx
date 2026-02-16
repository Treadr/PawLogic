import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginWithDevToken, verifyToken, logout as doLogout, getStoredUserId } from '../services/auth';
import { getAuthToken } from '../services/api';

interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      verifyToken()
        .then((res) => setUserId(res.user_id))
        .catch(() => {
          doLogout();
          setUserId(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      const stored = getStoredUserId();
      if (stored) setUserId(stored);
      setIsLoading(false);
    }
  }, []);

  const login = async (id: string) => {
    await loginWithDevToken(id);
    setUserId(id);
  };

  const logout = () => {
    doLogout();
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated: !!userId, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
