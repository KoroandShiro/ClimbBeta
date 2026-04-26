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
