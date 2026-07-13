/**
 * @file AuthContext.tsx
 * @description Contexto de autenticação para a app mobile. Expõe token, user, login, logout.
 *
 * Notas:
 *  - Persiste token em SecureStore (ou expo-secure-store) no ambiente mobile.
 *
 * Testes:
 *  - src/__tests__/contexts/authContext.test.tsx
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login, logout, logoutServer, getStoredToken } from '../services/authService';

interface AuthContextValue {
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        logout().then(() => {
            getStoredToken().then(stored => {
                setToken(stored);
                setIsLoading(false);
            });
        });
    }, []);

    const handleLogin = async (email: string, password: string) => {
        await login(email, password);
        const stored = await getStoredToken();
        setToken(stored);
    };

    const handleLogout = async () => {
        await logoutServer();  // revoke on the server while the token still exists
        await logout();        // then clear the local token
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, isLoading, login: handleLogin, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}