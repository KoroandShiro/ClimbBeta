import { apiFetch } from './api';

interface LoginResponse {
    token: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    role: string;
    status: 'PENDING' | 'VERIFIED';
}

export const login = async (email: string, passwordRaw: string): Promise<string> => {
    const data = await apiFetch<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordRaw }),
    });
    return data.token;
};

export const getMe = (): Promise<UserProfile> => {
    return apiFetch<UserProfile>('/users/me');
};

export const verifyCode = (code: string): Promise<UserProfile> => {
    return apiFetch<UserProfile>('/users/verify-code', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
};

export const logout = (): void => {};
