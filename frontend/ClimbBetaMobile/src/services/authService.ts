import { apiFetch, setAuthToken } from './api';

interface LoginResponse {
    token: string;
}

export async function loginAndSetToken(email: string, passwordRaw: string): Promise<void> {
    const data = await apiFetch<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordRaw }),
    });

    setAuthToken(data.token);
}
