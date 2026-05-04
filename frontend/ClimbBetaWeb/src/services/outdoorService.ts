import { apiFetch } from './api';

export interface OutdoorRoute {
    id: number;
    creatorId: number | null;
    name: string | null;
    sector: string;
    location: string;
    grade: string;
}

export const getAllOutdoorRoutes = (): Promise<OutdoorRoute[]> => {
    return apiFetch<OutdoorRoute[]>('/outdoor-routes');
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

export const getOutdoorRouteById = (id: number): Promise<OutdoorRoute> => {
    return apiFetch<OutdoorRoute>(`/outdoor-routes/${id}`);
};
