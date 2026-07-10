/**
 * @file socialService.ts
 * @description Serviços para a componente social da app: feed, follows, comentários e interações.
 *
 * Testes:
 *  - src/__tests__/services/socialService.test.ts
 */
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

/** Climbers who follow the given user (each flagged with whether I follow them back). */
export const getFollowers = (userId: number): Promise<UserSearchResult[]> => {
    return apiFetch<UserSearchResult[]>(`/climbers/${userId}/followers`);
};

/** Climbers that the given user follows. */
export const getFollowing = (userId: number): Promise<UserSearchResult[]> => {
    return apiFetch<UserSearchResult[]>(`/climbers/${userId}/following`);
};