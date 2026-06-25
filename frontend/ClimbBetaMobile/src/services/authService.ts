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

export async function login(email: string, passwordRaw: string): Promise<void> {
    const data = await apiFetch<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordRaw }),
    });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
}

export async function register(username: string, email: string, passwordRaw: string): Promise<UserResponse> {
    return apiFetch<UserResponse>('/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, passwordRaw, role: 'CLIMBER' }),
    });
}

export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}