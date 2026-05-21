// frontend/ClimbBetaMobile/src/services/profileService.ts
import { apiFetch } from './api';

export interface Profile {
    id: number;
    userId: number;
    maxGrade?: string | null;
    apeIndex?: string | null;
    // adicionar outros campos conforme o backend devolve
    bio?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
    name?: string | null;
}

export async function getMyProfile(): Promise<Profile> {
    return apiFetch<Profile>('/profiles/me');
}
