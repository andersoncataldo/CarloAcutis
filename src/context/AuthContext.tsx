import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { StreakInfo, UserProfile } from '../types/api.types';

export type { UserProfile, StreakInfo };

interface AuthContextData {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  streak: StreakInfo | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthSession: (user: UserProfile | null, streak: StreakInfo | null) => void;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: false,
  isAdmin: false,
  streak: null,
  signOut: async () => {},
  refreshUser: async () => {},
  setAuthSession: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthSession = useCallback((nextUser: UserProfile | null, nextStreak: StreakInfo | null) => {
    setUser(nextUser);
    setStreak(nextStreak);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setStreak(data.streak);
    } catch (err) {
      // Falha na API não pode derrubar páginas públicas (Home e Biografia).
      console.error('Erro ao verificar sessão:', err);
      setUser(null);
      setStreak(null);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadSession = async () => {
      try {
        const data = await api.getMe(controller.signal);
        if (!active) return;
        setUser(data.user);
        setStreak(data.streak);
      } catch (err) {
        if (!active) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Erro ao carregar sessão inicial:', err);
        setUser(null);
        setStreak(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Erro ao encerrar sessão:', err);
    } finally {
      setUser(null);
      setStreak(null);
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, streak, signOut, refreshUser, setAuthSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
