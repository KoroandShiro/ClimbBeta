/**
 * @file gymService.ts
 * @description Serviços relacionados com ginásios no mobile, incluindo leitura de gyms, paredes e detalhe de ginásio.
 *
 * Testes:
 *  - src/__tests__/services/gymService.test.ts
 */
import { apiFetch } from './api';

export interface Gym {
    id: number;
    ownerId: number;
    name: string;
    address: string;
    city: string;
    coverImageUrl: string | null;
}

export interface Boulder {
    id: number;
    gymId: number;
    color: string;
    hexColor: string | null;
    grade: string;
    setterName: string | null;
    setDate: string;
    isActive: boolean;
    imageUrl: string | null;
}
/** Fetches a collection of all registered climbing gyms in the system. */
export function getGyms(): Promise<Gym[]> {
    return apiFetch<Gym[]>('/gyms');
}
/** Retrieves only active, open boulders available at a specific gym instance. */
export function getActiveBoulders(gymId: number): Promise<Boulder[]> {
    return apiFetch<Boulder[]>(`/gyms/${gymId}/boulders`);
}

// Interface for the leaderboard ranking
export interface LeaderboardEntry {
    climberId: number;
    username: string;
    avatarUrl: string | null;
    attempts: number;
    style: string;
    date: string;
}
/** Resolves explicit target metadata structures belonging to a single boulder entry. */
export function getBoulderById(boulderId: number): Promise<Boulder> {
    return apiFetch<Boulder>(`/boulders/${boulderId}`);
}
/** Obtains top ascending climber rankings listed chronologically for a dynamic leaderboard. */
export function getLeaderboard(boulderId: number): Promise<LeaderboardEntry[]> {
    return apiFetch<LeaderboardEntry[]>(`/boulders/${boulderId}/leaderboard`);
}

// --- NEW SAVE / PROJECT ENDPOINTS ---

/** Flags a boulder target into the user's localized custom wish project checklist. */
export function saveProject(boulderId: number): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/boulders/${boulderId}/save`, { method: 'POST' });
}

/** Remotely detaches and drops a project association entry off the user's bookmark list. */
export function unsaveProject(boulderId: number): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/boulders/${boulderId}/save`, { method: 'DELETE' });
}
/** Verifies whether a dedicated target route is currently favorited by the local active session profile. */
export function checkSaveStatus(boulderId: number): Promise<{ isSaved: boolean }> {
    return apiFetch<{ isSaved: boolean }>(`/boulders/${boulderId}/save-status`);
}