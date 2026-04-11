import { apiFetch } from './api';

// Definimos exatamente o que a API devolve
interface LoginResponse {
    token: string;
}

export const login = async (email: string, passwordRaw: string): Promise<boolean> => {
    // Dizemos ao apiFetch que esperamos receber um objeto do tipo LoginResponse
    const data = await apiFetch<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordRaw }),
    });

    localStorage.setItem('@ClimbBeta:token', data.token);
    return true;
};

export const logout = (): void => {
    localStorage.removeItem('@ClimbBeta:token');
};