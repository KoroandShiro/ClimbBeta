import { apiFetch } from './api';

export interface ClimberProfileWithUserDTO {
    userId: number;
    username: string;
    email: string;
    bio?: string | null;
    height?: number | null;
    apeIndex?: number | null;
    avatarUrl?: string | null;
}

export interface UpdateProfileInput {
    bio?: string | null;
    height?: number | null;
    apeIndex?: number | null;
}

export async function getMyProfile(): Promise<ClimberProfileWithUserDTO> {
    return apiFetch<ClimberProfileWithUserDTO>('/profiles/me');
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<ClimberProfileWithUserDTO> {
    return apiFetch<ClimberProfileWithUserDTO>('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

export interface SavedBoulderDTO {
    id: number;
    gymId: number;
    color: string;
    hexColor?: string;
    grade: string;
    setterName?: string;
    imageUrl?: string | null;
}

export async function getMySavedProjects(): Promise<SavedBoulderDTO[]> {
    return apiFetch<SavedBoulderDTO[]>('/profiles/me/projects');
}
