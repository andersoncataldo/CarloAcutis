<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js';
=======
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a

export interface Liga {
  id: number;
  nome: string;
<<<<<<< HEAD
  codigoAcesso?: string;
=======
  codigoAcesso: string;
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
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

<<<<<<< HEAD
const PROFILE_COLUMNS = 'id, nome, email, xp, nivel, role, liga_id, liga:ligas(id, nome)';

=======
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);

<<<<<<< HEAD
  // Evita chamadas duplicadas de fetchProfile/registrar_acesso: o Supabase
  // dispara onAuthStateChange tanto na sessão inicial (INITIAL_SESSION)
  // quanto em eventos como TOKEN_REFRESHED, que não exigem recarregar
  // perfil/streak porque o usuário logado não mudou.
  const acessoRegistradoParaRef = useRef<string | null>(null);
  const perfilCarregadoParaRef = useRef<string | null>(null);

  const registrarAcesso = useCallback(async (userId: string) => {
    if (acessoRegistradoParaRef.current === userId) return;
    acessoRegistradoParaRef.current = userId;
    try {
      const { data, error } = await supabase.rpc('registrar_acesso');
      if (error) {
        console.error('Erro ao registrar acesso diário:', error.message);
        return;
      }
      if (data) {
        setStreak(data as StreakInfo);
      }
    } catch (err) {
      // Falha ao registrar streak não deve travar o app nem o login.
=======
  // Registra o acesso do dia (atualiza sequência/streak) sem bloquear a UI
  const registrarAcesso = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('registrar_acesso');
      if (!error && data) {
        setStreak(data as StreakInfo);
      }
    } catch (err) {
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
      console.error('Erro ao registrar acesso diário:', err);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
<<<<<<< HEAD
        .select(PROFILE_COLUMNS)
=======
        .select('*, liga:ligas(*)')
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
        .eq('id', userId)
        .single();

      if (error) {
<<<<<<< HEAD
        // PGRST116 = nenhuma linha encontrada. Pode acontecer se a trigger
        // de criação de perfil ainda não rodou (corrida rara no cadastro).
        console.error('Erro ao buscar perfil:', error.message);
        setUser(null);
        return;
      }

      if (!profile) {
        setUser(null);
        return;
      }

      setUser(profile as unknown as UserProfile);
      perfilCarregadoParaRef.current = userId;
    } catch (err) {
      console.error('Erro ao conectar ao perfil:', err);
      setUser(null);
=======
        console.error('Erro ao buscar perfil:', error);
      } else {
        setUser(profile as UserProfile);
      }
    } catch (err) {
      console.error('Erro ao conectar ao perfil:', err);
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (authUser) {
      await fetchProfile(authUser.id);
    }
  }, [authUser, fetchProfile]);

  useEffect(() => {
<<<<<<< HEAD
    let ativo = true;

    const handleSession = async (_event: AuthChangeEvent, session: Session | null) => {
      if (!ativo) return;

      setAuthUser(session?.user ?? null);

      if (session?.user) {
        // TOKEN_REFRESHED mantém o mesmo usuário: não precisa recarregar
        // perfil nem registrar acesso de novo.
        if (perfilCarregadoParaRef.current !== session.user.id) {
          await fetchProfile(session.user.id);
        }
        if (!ativo) return;
        registrarAcesso(session.user.id);
      } else {
        setUser(null);
        setStreak(null);
        perfilCarregadoParaRef.current = null;
        acessoRegistradoParaRef.current = null;
      }

      if (ativo) setLoading(false);
    };

    // onAuthStateChange já dispara imediatamente com a sessão atual
    // (evento INITIAL_SESSION), então não é necessário chamar
    // supabase.auth.getSession() em paralelo — isso é o que causava a
    // dupla chamada de fetchProfile/registrar_acesso no carregamento.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(event, session);
    });

    // Rede de segurança: se por algum motivo o evento inicial não chegar
    // (ex. aba em background), não deixa a UI presa em "carregando" para sempre.
    const timeoutId = window.setTimeout(() => {
      if (ativo) setLoading((current) => (current ? false : current));
    }, 8000);

    return () => {
      ativo = false;
      window.clearTimeout(timeoutId);
=======
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
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
      subscription.unsubscribe();
    };
  }, [fetchProfile, registrarAcesso]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
    setStreak(null);
<<<<<<< HEAD
    perfilCarregadoParaRef.current = null;
    acessoRegistradoParaRef.current = null;
=======
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
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
