import { authApi } from '@apis';
import type { User } from '@types';
import { Logger } from '@utils';
import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const fetchUserInfo = async () => {
    try {
      const res = await authApi.getAuthInfo();
      setUser(res);
      localStorage.setItem('user', JSON.stringify(res));
    } catch (err: any) {
      Logger.error('Auth check failed:', err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (accessToken: string) => {
    setLoading(true);
    try {
      localStorage.setItem('accessToken', accessToken);
      const res = await authApi.getAuthInfo();
      setUser(res);
      localStorage.setItem('user', JSON.stringify(res));
    } catch (error) {
      Logger.error('Login processing failed:', error);
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token) {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      fetchUserInfo();
    } else {
      setLoading(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
