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

export async function getMyProfile(): Promise<ClimberProfileWithUserDTO> {
    return apiFetch<ClimberProfileWithUserDTO>('/profiles/me');
}
