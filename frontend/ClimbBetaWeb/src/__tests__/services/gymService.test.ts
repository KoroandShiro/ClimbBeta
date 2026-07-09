// src/__tests__/services/gymService.test.ts
import { getGyms, getActiveBoulders, createGym, createBoulder,  uploadMedia } from '../../services/gymService';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('gymService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('getGyms', () => {
        it('deve retornar uma lista de ginásios', async () => {
            const mockGyms = [
                { id: 1, ownerId: 1, name: 'Gym 1', address: 'Street 1', city: 'Lisbon', coverImageUrl: null },
                { id: 2, ownerId: 1, name: 'Gym 2', address: 'Street 2', city: 'Porto', coverImageUrl: null },
            ];
            (api.apiFetch as jest.Mock).mockResolvedValue(mockGyms);

            const gyms = await getGyms();

            expect(gyms).toEqual(mockGyms);
            expect(api.apiFetch).toHaveBeenCalledWith('/gyms');
        });
    });

    describe('getActiveBoulders', () => {
        it('deve retornar uma lista de rotas ativas para um ginásio', async () => {
            const mockBoulders = [
                { id: 1, gymId: 1, color: 'Red', hexColor: '#EF4444', grade: 'V0', setterName: 'John', setDate: '2026-07-01', isActive: true, imageUrl: null },
            ];
            (api.apiFetch as jest.Mock).mockResolvedValue(mockBoulders);

            const boulders = await getActiveBoulders(1);

            expect(boulders).toEqual(mockBoulders);
            expect(api.apiFetch).toHaveBeenCalledWith('/gyms/1/boulders');
        });
    });

    describe('createGym', () => {
        it('deve criar um novo ginásio', async () => {
            const newGym = { ownerId: 1, name: 'New Gym', address: 'Street 3', city: 'Covilhã' };
            const mockResponse = { id: 3, ...newGym, coverImageUrl: null };
            (api.apiFetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await createGym(newGym);

            expect(result).toEqual(mockResponse);
            expect(api.apiFetch).toHaveBeenCalledWith('/gyms', {
                method: 'POST',
                body: JSON.stringify(newGym),
            });
        });
    });

    describe('createBoulder', () => {
        it('deve criar uma nova rota num ginásio', async () => {
            const boulderData = {
                color: 'Blue',
                hexColor: '#3B82F6',
                grade: 'V2',
                setterName: 'Jane',
                setDate: '2026-07-05',
                imageUrl: null,
            };
            const mockResponse = { id: 1, gymId: 1, ...boulderData, isActive: true };
            (api.apiFetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await createBoulder(1, boulderData);

            expect(result).toEqual(mockResponse);
            expect(api.apiFetch).toHaveBeenCalledWith('/gyms/1/boulders', {
                method: 'POST',
                body: JSON.stringify(boulderData),
            });
        });
    });

    describe('uploadMedia', () => {
        it('deve fazer upload de um ficheiro de imagem', async () => {
            localStorage.setItem('climbbeta_token', 'test-token');
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({ url: 'https://example.com/image.jpg' }),
            });
            window.fetch = mockFetch as any;

            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const result = await uploadMedia(file);

            expect(result).toBe('https://example.com/image.jpg');
            expect(mockFetch).toHaveBeenCalled();
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/media/upload');
            expect(options.method).toBe('POST');
        });

        it('deve lançar erro quando o upload falha', async () => {
            localStorage.setItem('climbbeta_token', 'test-token');
            const mockFetch = jest.fn().mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValue({ error: 'Upload failed' }),
            });
            window.fetch = mockFetch as any;

            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

            await expect(uploadMedia(file)).rejects.toThrow('Upload failed');
        });
    });
});