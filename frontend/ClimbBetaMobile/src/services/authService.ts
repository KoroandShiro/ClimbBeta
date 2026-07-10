/**
 * @file authService.ts
 * @description Serviços de autenticação no mobile: login, register, getMe e logout.
 *
 * Testes:
 *  - src/__tests__/services/authService.test.ts
 */
import * as SecureStore from 'expo-secure-store';
import { apiFetch, TOKEN_KEY } from './api';

interface LoginResponse {
    token: string;
}

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    role: string;
}

/**
 * Realiza a autenticação por credenciais e persiste o token de acesso no armazenamento seguro.
 * * @param {string} email Email único cadastrado do utilizador.
 * @param {string} passwordRaw Palavra-passe em texto limpo para verificação no backend.
 */
export async function login(email: string, passwordRaw: string): Promise<void> {
    const data = await apiFetch<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordRaw }),
    });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
}

/**
 * Regista uma nova conta de utilizador no sistema com a role fixa padrão de escalador.
 */
export async function register(username: string, email: string, passwordRaw: string): Promise<UserResponse> {
    return apiFetch<UserResponse>('/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, passwordRaw, role: 'CLIMBER' }),
    });
}

/**
 * Revoga a sessão local purgando o token de segurança armazenado no dispositivo hardware.
 */
export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Lê diretamente do chaveiro nativo do SO o token JWT atualmente armazenado, se existir.
 */
export async function getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}