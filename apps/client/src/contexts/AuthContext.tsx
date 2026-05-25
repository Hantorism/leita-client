import { authApi } from '@leita/api';
import type { User } from '@leita/types';
import { AuthStorage, AUTH_EVENT, Logger } from '@utils';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState, useCallback } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    AuthStorage.clear();
    setUser(null);
    window.location.reload();
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await authApi.getAuthInfo();
      setUser(res);
      AuthStorage.setUser(res);
    } catch (err: any) {
      Logger.error('Auth check failed:', err);
      // If 401, Axios interceptor will handle it via event
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (accessToken: string) => {
    setLoading(true);
    try {
      AuthStorage.setAccessToken(accessToken);
      const res = await authApi.getAuthInfo();
      setUser(res);
      AuthStorage.setUser(res);
    } catch (error) {
      Logger.error('Login processing failed:', error);
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Handle external auth events (e.g. from Axios interceptor)
  useEffect(() => {
    const handleAuthEvent = (event: any) => {
      if (event.detail?.action === 'LOGOUT') {
        logout();
      }
    };

    window.addEventListener(AUTH_EVENT, handleAuthEvent);
    
    // Initial load
    const token = AuthStorage.getAccessToken();
    const storedUser = AuthStorage.getUser();

    if (token) {
      if (storedUser) {
        setUser(storedUser);
      }
      fetchUserInfo();
    } else {
      setLoading(false);
      setUser(null);
    }

    return () => {
      window.removeEventListener(AUTH_EVENT, handleAuthEvent);
    };
  }, [logout, fetchUserInfo]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      fetchUserInfo,
    }),
    [user, loading, login, logout, fetchUserInfo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
