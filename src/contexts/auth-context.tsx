'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  type AuthenticatedUser,
  type SignupPayload,
  getProfile,
  login as apiLogin,
  logout as apiLogout,
  refreshToken,
  signup as apiSignup,
  getAccessToken
} from '@/lib/auth-service';

export type AuthUser = AuthenticatedUser;

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshed = await refreshToken();
        if (refreshed || getAccessToken()) {
          const profile = await getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.warn('Auth bootstrap failed', error);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (email: string, password: string) => {
      setLoading(true);
      try {
        await apiLogin(email, password);
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    logout: async () => {
      setLoading(true);
      try {
        await apiLogout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    signup: async (payload: SignupPayload) => {
      setLoading(true);
      try {
        await apiSignup(payload);
        await apiLogin(payload.email, payload.password);
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
