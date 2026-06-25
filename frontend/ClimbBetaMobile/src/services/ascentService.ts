import { apiFetch } from './api';

export interface AscentInput {
    boulderId?: number | null;
    outdoorRouteId?: number | null;
    freelogGymName?: string | null;
    freelogGrade?: string | null;
    /** Formato string esperado: YYYY-MM-DD */
    date: string;
    attempts: number;
    style: string | null;
    notes: string | null;
}

export interface Ascent {
    id: number;
    boulderId?: number | null;
    outdoorRouteId?: number | null;
    freelogGymName?: string | null;
    freelogGrade?: string | null;
    date: string;
    attempts: number;
    style: string | null;
    notes: string | null;
    boulderName?: string | null;
    gymName?: string | null;
}

export interface FeedItem {
    ascent: Ascent;
    authorUsername: string;
    authorAvatarUrl?: string | null;
    postImageUrl?: string | null;
    routeName?: string | null;
    routeGrade?: string | null;
}

/**
 * Regista uma subida com sucesso (ascent) no histórico do escalador.
 * * @param {AscentInput} data Payload com os metadados do encadeamento da via ou bloco.
 */
export async function logAscent(data: AscentInput): Promise<{ id: number }> {
    return apiFetch<{ id: number }>('/ascents', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Recupera o histórico cronológico de escaladas (logbook) do utilizador autenticado.
 */
export async function getMyAscents(): Promise<Ascent[]> {
    return apiFetch<Ascent[]>('/ascents/me');
}

/**
 * Obtém o feed social global consolidando os últimos logs e uploads da rede de escaladores.
 */
export async function getFeed(): Promise<FeedItem[]> {
    return apiFetch<FeedItem[]>('/feed');
}