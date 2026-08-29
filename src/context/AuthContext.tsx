import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface Liga {
  id: number;
  nome: string;
  codigoAcesso: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  xp: number;
  nivel: string;
  role: 'user' | 'admin';
  liga_id: number | null;
  liga?: Liga | null;
}

export interface StreakInfo {
  streak_atual: number;
  maior_streak: number;
}

interface AuthContextData {
  user: UserProfile | null;
  authUser: SupabaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  streak: StreakInfo | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  // Registra o acesso do dia (atualiza sequência/streak) sem bloquear a UI
  const registrarAcesso = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('registrar_acesso');
      if (!error && data) {
        setStreak(data as StreakInfo);
      }
    } catch (err) {
      console.error('Erro ao registrar acesso diário:', err);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, liga:ligas(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
      } else {
        setUser(profile as UserProfile);
      }
    } catch (err) {
      console.error('Erro ao conectar ao perfil:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (authUser) {
      await fetchProfile(authUser.id);
    }
  }, [authUser, fetchProfile]);

  useEffect(() => {
    // Session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        registrarAcesso();
      }
      setLoading(false);
    });

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
        registrarAcesso();
      } else {
        setUser(null);
        setStreak(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, registrarAcesso]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
    setStreak(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, authUser, loading, isAdmin, streak, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
