import { apiFetch, ApiError } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

// Mock do SecureStore
jest.mock('expo-secure-store');

// Mock do global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiFetch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve injetar o token de autorização se ele existir', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('fake-token');
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ success: true }),
            text: jest.fn().mockResolvedValue('{"success": true}'),
        });

        await apiFetch('/test');

        // Capturamos os argumentos passados ao fetch
        const [url, options] = mockFetch.mock.calls[0];

        expect(url).toBe('http://10.0.2.2:8080/test');

        // Verificamos se o Authorization header foi definido corretamente
        const headers = options.headers;
        expect(headers.get('Authorization')).toBe('Bearer fake-token');
    });

    it('deve lançar ApiError quando a resposta não for ok', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
        });

        await expect(apiFetch('/protected')).rejects.toThrow(ApiError);
        await expect(apiFetch('/protected')).rejects.toMatchObject({ status: 401 });
    });

    it('deve retornar null se o status for 204', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 204,
        });

        const result = await apiFetch('/no-content');
        expect(result).toBeNull();
    });

    it('deve usar a mensagem padrão se o erro da API não for JSON', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockRejectedValue(new Error('Invalid JSON')), // Simula falha de parsing
        });

        await expect(apiFetch('/fail')).rejects.toThrow('Server communication error.');
    });
});