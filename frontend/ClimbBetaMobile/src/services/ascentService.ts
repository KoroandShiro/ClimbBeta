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
    /** 'INDOOR' (partner gym boulder) | 'FREELOG_GYM' (non-partner gym) | 'OUTDOOR'. */
    logType?: string;
    /** Partner gym name (for INDOOR logs). */
    gymName?: string | null;
    likeCount?: number;
    likedByMe?: boolean;
    commentCount?: number;
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

/** Payload do Free Log híbrido (ginásio não-parceiro OU rocha/outdoor). */
export interface FreelogInput {
    mode: 'GYM' | 'ROCK';
    freelogGymName?: string | null;
    grade: string;
    routeName?: string | null;
    sector?: string | null;
    location?: string | null;
    /** YYYY-MM-DD; se omitido o backend assume hoje. */
    date?: string | null;
    attempts: number;
    style: string | null;
    notes: string | null;
    /** URL devolvido por uploadMedia(), já alojado no MinIO. */
    mediaUrl?: string | null;
}

/**
 * Regista um Free Log híbrido: sessão num ginásio não-parceiro ("GYM") ou subida
 * em rocha ("ROCK", que reutiliza/cria a via outdoor). Foto opcional via mediaUrl.
 */
export async function logFreelog(data: FreelogInput): Promise<{ id: number }> {
    return apiFetch<{ id: number }>('/ascents/freelog', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Envia um ficheiro de media (foto) para o MinIO via /media/upload e devolve o URL público.
 * O apiFetch deteta o FormData e deixa o Content-Type (com boundary) ser definido pelo motor nativo.
 */
export async function uploadMedia(formData: FormData): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('/media/upload', {
        method: 'POST',
        body: formData,
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

/** A climber's own ascents enriched as feed items (for the profile history). */
export async function getClimberAscents(userId: number): Promise<FeedItem[]> {
    return apiFetch<FeedItem[]>(`/climbers/${userId}/ascents`);
}

/** A comment on an ascent, already joined with its author. */
export interface CommentItem {
    id: number;
    authorId: number;
    authorUsername: string;
    authorAvatarUrl?: string | null;
    text: string;
    createdAt: string;
}

/** Enriched single ascent (author, image, route, like/comment counts) for the detail screen. */
export async function getAscentDetail(id: number): Promise<FeedItem> {
    return apiFetch<FeedItem>(`/ascents/${id}/details`);
}

export async function likeAscent(id: number): Promise<void> {
    return apiFetch(`/ascents/${id}/like`, { method: 'POST' });
}

export async function unlikeAscent(id: number): Promise<void> {
    return apiFetch(`/ascents/${id}/like`, { method: 'DELETE' });
}

export async function getComments(id: number): Promise<CommentItem[]> {
    return apiFetch<CommentItem[]>(`/ascents/${id}/comments`);
}

export async function addComment(id: number, text: string): Promise<CommentItem> {
    return apiFetch<CommentItem>(`/ascents/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
}