import { apiFetch } from './api';

export interface OutdoorRoute {
    id: number;
    creatorId: number | null;
    name: string | null;
    sector: string;
    location: string;
    grade: string;
    // Se o backend suportar coords no futuro:
    // latitude?: number | null;
    // longitude?: number | null;
}

export const getOutdoorRoutes = (): Promise<OutdoorRoute[]> => {
    return apiFetch<OutdoorRoute[]>('/outdoor-routes');
};

export const getOutdoorRouteById = (id: number): Promise<OutdoorRoute> => {
    return apiFetch<OutdoorRoute>(`/outdoor-routes/${id}`);
};

export const createOutdoorRoute = (payload: {
    name?: string | null;
    sector: string;
    location: string;
    grade: string;
}): Promise<{ id: number }> => {
    return apiFetch<{ id: number }>('/outdoor-routes', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};
