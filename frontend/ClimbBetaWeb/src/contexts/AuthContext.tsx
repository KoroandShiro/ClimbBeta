/**
 * @file AuthContext.tsx
 * @description Contexto de autenticação que expõe token, user, login, logout e updateUserStatus.
 *              Persiste token e user em localStorage e busca o perfil com `getMe`.
 *
 * Exports:
 *  - AuthProvider: provider que envolve a aplicação
 *  - useAuth(): hook para aceder ao contexto
 *
 * Dependências:
 *  - ../services/authService (getMe)
 *
 * Testes:
 *  - src/__tests__/contexts/AuthContext.test.tsx
 *
 * Notas:
 *  - Evitar lógica pesada aqui; preferir serviços para chamadas de rede.
 */
import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { getMe, type UserProfile } from '../services/authService';

export type { UserProfile };

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (newToken: string) => Promise<void>;
  logout: () => void;
  updateUserStatus: (status: 'PENDING' | 'VERIFIED') => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('climbbeta_token');
    const storedUser = localStorage.getItem('climbbeta_user');
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('climbbeta_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (newToken: string): Promise<void> => {
    localStorage.setItem('climbbeta_token', newToken);
    setToken(newToken);
    try {
      const userProfile = await getMe();
      localStorage.setItem('climbbeta_user', JSON.stringify(userProfile));
      setUser(userProfile);
    } catch (e) {
      console.error('Falha ao carregar perfil de utilizador', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('climbbeta_token');
    localStorage.removeItem('climbbeta_user');
    setToken(null);
    setUser(null);
  };

  const updateUserStatus = (status: 'PENDING' | 'VERIFIED') => {
    if (!user) return;
    const updated = { ...user, status };
    localStorage.setItem('climbbeta_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUserStatus, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth tem de ser usado dentro de um AuthProvider');
  }
  return context;
}
