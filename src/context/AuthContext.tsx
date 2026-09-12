'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthSession, User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: (accountNumber: 1 | 2 | 3) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ivy_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        // Ensure session has not expired
        if (parsed.expires_at > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const newSession = await api.login(email, password);
    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  };

  const logout = async () => {
    if (session?.token) {
      await api.logout(session.token);
    }
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const loginDemo = async (num: 1 | 2 | 3) => {
    const email = `demo${num}@ivy.homes`;
    const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'demo-password';
    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        token: session?.token || null,
        isLoading,
        login,
        logout,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
