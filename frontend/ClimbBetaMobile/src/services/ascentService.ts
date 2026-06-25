import { apiFetch } from './api';

export interface AscentInput {
    boulderId?: number | null;
    outdoorRouteId?: number | null;
    freelogGymName?: string | null;
    freelogGrade?: string | null;
    date: string; // Format: YYYY-MM-DD
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

export async function logAscent(data: AscentInput): Promise<{ id: number }> {
    return apiFetch<{ id: number }>('/ascents', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getMyAscents(): Promise<Ascent[]> {
    return apiFetch<Ascent[]>('/ascents/me');
}

export interface FeedItem {
    ascent: Ascent;
    authorUsername: string;
    authorAvatarUrl?: string | null;
    postImageUrl?: string | null;
    routeName?: string | null;
    routeGrade?: string | null;
}

// New function to fetch the feed
export async function getFeed(): Promise<FeedItem[]> {
    return apiFetch<FeedItem[]>('/feed');
}