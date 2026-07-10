/**
 * @file services/api.ts
 * @description Helper para chamadas HTTP no mobile; injeta token, trata respostas e errors.
 *
 * Export:
 *  - apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T>
 *
 * Testes:
 *  - src/__tests__/services/api.test.ts
 */
import * as SecureStore from 'expo-secure-store';

/**
 * Endpoint base do servidor remoto para consumo da API REST.
 * Fallback configurado para o loopback padrão do emulador Android (10.0.2.2).
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

/** Key padrão de armazenamento seguro para persistência do JSON Web Token (JWT). */
export const TOKEN_KEY = 'climbbeta_token';

/**
 * Classe customizada para encapsulamento de falhas HTTP originadas pela API.
 * Mantém o payload do status de erro para tratamento granular nos ecrãs de interface.
 */
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * Wrapper genérico assíncrono para execução de requisições HTTP via Fetch API.
 * Injeta credenciais JWT automaticamente, formata payloads de saída e intercepta respostas sem sucesso.
 * * @template T Tipo de retorno esperado no corpo da resposta de sucesso.
 * @param {string} endpoint Segmento da URI do endpoint (ex: '/users/login').
 * @param {RequestInit} [options={}] Opções nativas de configuração da requisição.
 * @returns {Promise<T>} Promise resolvida com os dados tipados do backend.
 * @throws {ApiError} Se o status HTTP da resposta estiver fora do range 2xx.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);

    // Se for FormData, o browser/motor nativo deve definir automaticamente o Content-Type com o boundary correto
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
            // Ignora falhas de parsing em corpos que não sejam JSON estruturado
        }
        throw new ApiError(errorMessage, response.status);
    }

    // HTTP 204 (ou respostas sem corpo, ex.: like/follow) não têm JSON para interpretar
    if (response.status === 204) {
        return null as T;
    }

    const body = await response.text();
    return (body ? JSON.parse(body) : null) as T;
}