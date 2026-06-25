import React, { createContext, useContext, useEffect, useState } from 'react';
import { login, logout, getStoredToken } from '../services/authService';

interface AuthContextValue {
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
        await logout();
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