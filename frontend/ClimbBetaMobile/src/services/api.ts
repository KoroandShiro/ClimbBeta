const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

let authToken: string | null = null;

export function setAuthToken(token: string) {
    authToken = token;
}

export function clearAuthToken() {
    authToken = null;
}

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

    // So define JSON content-type when body is not FormData
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = 'Erro de comunicação com o servidor.';
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
