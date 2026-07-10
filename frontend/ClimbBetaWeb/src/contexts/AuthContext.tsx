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
      // The token was accepted but the profile could not be loaded. Roll back the partial
      // login so the app is not left "authenticated" without a user, and re-throw so the
      // caller (the login screen) can tell the user that something went wrong.
      console.error('Failed to load user profile', e);
      localStorage.removeItem('climbbeta_token');
      localStorage.removeItem('climbbeta_user');
      setToken(null);
      setUser(null);
      throw new Error('We could not load your profile. Please try signing in again.');
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
