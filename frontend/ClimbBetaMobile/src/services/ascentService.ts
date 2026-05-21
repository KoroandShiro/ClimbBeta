import { apiFetch } from './api';

export interface AscentInput {
    boulderId?: number | null;
    outdoorRouteId?: number | null;
    freelogGymName?: string | null;
    freelogGrade?: string | null;
    date: string; // Formato: YYYY-MM-DD
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
    // campos adicionais que o backend possa devolver
    boulderName?: string | null;
    gymName?: string | null;
}


export async function logAscent(data: AscentInput): Promise<{ id: number }> {
    return apiFetch<{ id: number }>('/ascents', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getMyAscents(): Promise<Ascent[]> {
    return apiFetch<Ascent[]>('/ascents/me');
}