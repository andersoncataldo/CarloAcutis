import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Liga {
  id: number;
  nome: string;
  codigoAcesso: string;
}

interface User {
  id: number;
  nome: string;
  nomeExibicao?: string; // Adding this as it's used in Navbar
  email: string;
  xp: number;
  nivel: string;
  liga: Liga | null;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async (jwtToken: string) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error("Erro ao validar sessão:", err);
      signOut();
    }
  }, [signOut]);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await fetchMe(token);
      }
      setLoading(false);
    };
    initAuth();
  }, [token, fetchMe]);

  const signIn = useCallback(async (jwtToken: string) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    await fetchMe(jwtToken);
  }, [fetchMe]);

  const refreshUser = useCallback(async () => {
    if (token) {
      const response = await api.get('/auth/me');
      setUser(response.data);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
