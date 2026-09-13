'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthSession, User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ivy_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize session into state and update ApiClient in-memory token
  const applySession = useCallback((newSession: AuthSession | null) => {
    setSession(newSession);
    if (newSession?.token) {
      api.setAuthToken(newSession.token, newSession.expires_at);
    } else {
      api.setAuthToken('', 0);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: AuthSession | null = stored ? JSON.parse(stored) : session;
      if (!parsed?.refresh_token) {
        return false;
      }
      const refreshed = await api.refresh(parsed.refresh_token);
      if (refreshed) {
        applySession(refreshed);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Session refresh failed', e);
      return false;
    }
  }, [session, applySession]);

  // Initial session restoration from localStorage
  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: AuthSession = JSON.parse(stored);
          const now = Date.now();

          // 1. If access token is still valid for at least 60s
          if (parsed.expires_at && parsed.expires_at > now + 60000) {
            applySession(parsed);

            // Silently enrich user locality if missing
            if (!parsed.user?.assigned_locality) {
              api.getCurrentUser(parsed.token).then((profile) => {
                if (profile?.assigned_locality) {
                  const updated: AuthSession = {
                    ...parsed,
                    user: { ...parsed.user, ...profile },
                  };
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                  applySession(updated);
                }
              }).catch(() => {});
            }
          } else if (parsed.refresh_token) {
            // 2. Access token expired or expiring soon: attempt silent recovery via 7-day refresh token
            const refreshed = await api.refresh(parsed.refresh_token);
            if (refreshed) {
              applySession(refreshed);
            } else {
              // Refresh token is completely dead; clear local session
              localStorage.removeItem(STORAGE_KEY);
              applySession(null);
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
            applySession(null);
          }
        }
      } catch (e) {
        console.error('Failed to load session from storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [applySession]);

  // Multi-tab synchronization and custom event listener from ApiClient
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            applySession(parsed);
          } catch (err) {
            applySession(null);
          }
        } else {
          applySession(null);
        }
      }
    };

    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AuthSession | null>;
      applySession(customEvent.detail ?? null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ivy_auth_changed', handleAuthEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ivy_auth_changed', handleAuthEvent);
    };
  }, [applySession]);

  // Proactive background auto-refresh timer (~90s before access token expires)
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!session || !session.refresh_token || !session.expires_at) {
      return;
    }

    const timeUntilExpiry = session.expires_at - Date.now();
    // Schedule refresh 90 seconds before expiry, or in at least 10 seconds if already close
    const refreshDelay = Math.max(10000, timeUntilExpiry - 90000);

    refreshTimerRef.current = setTimeout(async () => {
      await refreshSession();
    }, refreshDelay);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [session, refreshSession]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newSession = await api.login(email, password);
      applySession(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (session?.token) {
        await api.logout(session.token);
      }
      applySession(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        token: session?.token || null,
        isLoading,
        isAuthenticated: !!session?.token,
        login,
        logout,
        refreshSession,
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
