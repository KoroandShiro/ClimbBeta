import { apiFetch } from './api';

// 1. Definimos os Tipos (As "Plantas" dos nossos objetos)
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

// O Input para criar um Boulder novo (não precisa do ID nem do isActive)
export type CreateBoulderInput = Omit<Boulder, 'id' | 'gymId' | 'isActive'>;

// 2. Criamos as funções que o Dashboard vai usar
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
