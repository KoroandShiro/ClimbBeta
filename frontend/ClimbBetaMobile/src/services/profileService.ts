import { apiFetch } from './api';

export interface ClimberProfileWithUserDTO {
    userId: number;
    username: string;
    email: string;
    bio?: string | null;
    height?: number | null;
    apeIndex?: number | null;
    avatarUrl?: string | null;
    followersCount?: number;
    followingCount?: number;
}

export interface UpdateProfileInput {
    username?: string | null;
    bio?: string | null;
    height?: number | null;
    apeIndex?: number | null;
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

/** Fetches core profile metadata metrics mapped for the active logged account. */
export async function getMyProfile(): Promise<ClimberProfileWithUserDTO> {
    return apiFetch<ClimberProfileWithUserDTO>('/profiles/me');
}

/** Updates structural text fields regarding the user's personal climber biometric specifications. */
export async function updateMyProfile(input: UpdateProfileInput): Promise<ClimberProfileWithUserDTO> {
    return apiFetch<ClimberProfileWithUserDTO>('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

/** Retrieves the comprehensive array of active user-bookmarked project boulders. */
export async function getMySavedProjects(): Promise<SavedBoulderDTO[]> {
    return apiFetch<SavedBoulderDTO[]>('/profiles/me/projects');
}

/**
 * Pipes a multi-part boundary stream payload directly into the object storage pipeline.
 * * @param {FormData} formData Native container instance wrapping the image file descriptor object.
 */
export async function uploadMyAvatar(formData: FormData): Promise<{ avatarUrl: string }> {
    return apiFetch<{ avatarUrl: string }>('/profiles/me/avatar', {
        method: 'POST',
        body: formData,
    });
}