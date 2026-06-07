import { apiFetch } from './api';

export interface UserSearchResult {
    id: number;
    username: string;
    avatarUrl: string | null;
    isFollowing: boolean;
}

export const searchUsers = (query: string): Promise<UserSearchResult[]> => {
    return apiFetch<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(query)}`);
};

export const followUser = (userId: number): Promise<void> => {
    return apiFetch(`/climbers/${userId}/follow`, { method: 'POST' });
};

export const unfollowUser = (userId: number): Promise<void> => {
    return apiFetch(`/climbers/${userId}/follow`, { method: 'DELETE' });
};