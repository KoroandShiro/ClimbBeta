import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

export const TOKEN_KEY = 'climbbeta_token';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    console.log("Attempting to call URL:", `${BASE_URL}${endpoint}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = 'Server communication error.';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMessage = errorData.error;
        } catch {
            // Ignore JSON parse errors
        }
        throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json() as Promise<T>;
}