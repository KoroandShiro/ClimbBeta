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

export function getGyms(): Promise<Gym[]> {
    return apiFetch<Gym[]>('/gyms');
}

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

export function getBoulderById(boulderId: number): Promise<Boulder> {
    return apiFetch<Boulder>(`/boulders/${boulderId}`);
}

export function getLeaderboard(boulderId: number): Promise<LeaderboardEntry[]> {
    return apiFetch<LeaderboardEntry[]>(`/boulders/${boulderId}/leaderboard`);
}

// --- NEW SAVE / PROJECT ENDPOINTS ---

// Replace your existing one with this (expects JSON from the backend):
export function saveProject(boulderId: number): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/boulders/${boulderId}/save`, { method: 'POST' });
}

// Add these two:
export function unsaveProject(boulderId: number): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/boulders/${boulderId}/save`, { method: 'DELETE' });
}

export function checkSaveStatus(boulderId: number): Promise<{ isSaved: boolean }> {
    return apiFetch<{ isSaved: boolean }>(`/boulders/${boulderId}/save-status`);
}