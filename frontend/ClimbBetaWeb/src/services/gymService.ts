import { apiFetch, BASE_URL } from './api';

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

export type CreateBoulderInput = Omit<Boulder, 'id' | 'gymId' | 'isActive'>;

export const getGyms = (): Promise<Gym[]> => {
    return apiFetch<Gym[]>('/gyms');
};

export const getActiveBoulders = (gymId: number): Promise<Boulder[]> => {
    return apiFetch<Boulder[]>(`/gyms/${gymId}/boulders`);
};

export const createBoulder = (gymId: number, boulderData: CreateBoulderInput): Promise<Boulder> => {
    return apiFetch<Boulder>(`/gyms/${gymId}/boulders`, {
        method: 'POST',
        body: JSON.stringify(boulderData),
    });
};

export interface GymUpdateRequest {
    name: string;
    address: string | null;
    city: string;
    coverImageUrl: string | null;
}

export const updateGym = async (gymId: number, gymData: GymUpdateRequest): Promise<Gym> => {
    const response = await apiFetch<Gym>(`/gyms/${gymId}`, {
        method: 'PUT',
        body: JSON.stringify(gymData),
    });
    return response;
};

export interface GymCreateData {
    ownerId: number;
    name: string;
    address: string;
    city: string;
    coverImageUrl?: string;
}

export const createGym = (data: GymCreateData): Promise<Gym> => {
    return apiFetch<Gym>('/gyms', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export interface UpdateBoulderStatusRequest {
    isActive: boolean;
}

export const archiveBoulder = (boulderId: number): Promise<void> => {
    return apiFetch(`/boulders/${boulderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: false }),
    });
};

// ---------------------------------------------------------
// NOVA FUNÇÃO: UPLOAD PARA O MINIO (Corrigida com BASE_URL)
// ---------------------------------------------------------
export const uploadMedia = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Usa a chave exata que está no teu api.ts
    const token = localStorage.getItem('climbbeta_token'); 
    
    // Forçamos o pedido para ir para o localhost:8080 em vez do localhost do Vite
    const response = await fetch(`${BASE_URL}/media/upload`, {
        method: 'POST',
        headers: token ? {
            'Authorization': `Bearer ${token}`
        } : {},
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao fazer upload da imagem.');
    }

    const data = await response.json();
    return data.url; 
};