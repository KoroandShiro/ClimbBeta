import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quando a app arranca (ou faz refresh), vai à gaveta (localStorage) ver se há token
  useEffect(() => {
    const storedToken = localStorage.getItem('climbbeta_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  // Função para fazer Login e guardar na gaveta
  const login = (newToken: string) => {
    localStorage.setItem('climbbeta_token', newToken);
    setToken(newToken);
  };

  // Função para fazer Logout e limpar a gaveta
  const logout = () => {
    localStorage.removeItem('climbbeta_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar em qualquer página
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth tem de ser usado dentro de um AuthProvider');
  }
  return context;
}