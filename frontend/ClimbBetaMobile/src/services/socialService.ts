import { apiFetch } from './api';

export interface UserSearchResult {
    id: number;
    username: string;
    avatarUrl: string | null;
    isFollowing: boolean;
}

/** Searches user handles indexed matching raw contextual pattern strings. */
export const searchUsers = (query: string): Promise<UserSearchResult[]> => {
    return apiFetch<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(query)}`);
};

/** Initiates a follow relationship status track towards a targeted target user context. */
export const followUser = (userId: number): Promise<void> => {
    return apiFetch(`/climbers/${userId}/follow`, { method: 'POST' });
};

/** Breaks and stops an existing active target social network observation tracking node. */
export const unfollowUser = (userId: number): Promise<void> => {
    return apiFetch(`/climbers/${userId}/follow`, { method: 'DELETE' });
};