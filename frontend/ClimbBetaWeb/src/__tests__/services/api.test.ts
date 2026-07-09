// src/__tests__/services/api.test.ts
import { apiFetch, BASE_URL } from '../../services/api';

// Mock do global fetch
const mockFetch = jest.fn();
window.fetch = mockFetch as any;

describe('apiFetch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('deve injetar o token de autorização se ele existir', async () => {
        localStorage.setItem('climbbeta_token', 'fake-token');
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ success: true }),
        });

        await apiFetch('/test');

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/test`);
        expect(options.headers.get('Authorization')).toBe('Bearer fake-token');
    });

    it('deve lançar erro quando a resposta não for ok', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
        });

        await expect(apiFetch('/protected')).rejects.toThrow('Unauthorized');
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
            json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        });

        await expect(apiFetch('/fail')).rejects.toThrow('Erro de comunicação com o servidor.');
    });

    it('deve adicionar Content-Type application/json automaticamente', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({}),
        });

        await apiFetch('/test');

        const [, options] = mockFetch.mock.calls[0];
        expect(options.headers.get('Content-Type')).toBe('application/json');
    });
});