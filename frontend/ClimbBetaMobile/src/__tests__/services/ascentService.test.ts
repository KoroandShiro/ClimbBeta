import * as api from '../../services/api';
import * as ascentService from '../../services/ascentService';

// Mock do serviço api
jest.mock('../../services/api');

describe('ascentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('logAscent deve chamar apiFetch com POST e o payload correto', async () => {
        const mockInput = { date: '2026-07-03', attempts: 1, style: 'Flash', notes: 'Top' } as any;
        (api.apiFetch as jest.Mock).mockResolvedValue({ id: 123 });

        await ascentService.logAscent(mockInput);

        expect(api.apiFetch).toHaveBeenCalledWith('/ascents', {
            method: 'POST',
            body: JSON.stringify(mockInput),
        });
    });

    it('getFeed deve chamar apiFetch para o endpoint /feed', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);

        await ascentService.getFeed();

        expect(api.apiFetch).toHaveBeenCalledWith('/feed');
    });

    it('likeAscent deve chamar apiFetch com o método POST', async () => {
        await ascentService.likeAscent(10);

        expect(api.apiFetch).toHaveBeenCalledWith('/ascents/10/like', { method: 'POST' });
    });

    it('unlikeAscent deve chamar apiFetch com o método DELETE', async () => {
        await ascentService.unlikeAscent(10);

        expect(api.apiFetch).toHaveBeenCalledWith('/ascents/10/like', { method: 'DELETE' });
    });

    it('logFreelog deve chamar apiFetch com o payload de Freelog', async () => {
        const mockFreelog = { mode: 'GYM', grade: '6a', attempts: 1 } as any;
        (api.apiFetch as jest.Mock).mockResolvedValue({ id: 99 });

        await ascentService.logFreelog(mockFreelog);

        expect(api.apiFetch).toHaveBeenCalledWith('/ascents/freelog', {
            method: 'POST',
            body: JSON.stringify(mockFreelog),
        });
    });

    it('uploadMedia deve passar o FormData diretamente', async () => {
        const mockFormData = new FormData();
        (api.apiFetch as jest.Mock).mockResolvedValue({ url: 'http://test.com/foto.jpg' });

        await ascentService.uploadMedia(mockFormData);

        expect(api.apiFetch).toHaveBeenCalledWith('/media/upload', {
            method: 'POST',
            body: mockFormData,
        });
    });

    it('addComment deve enviar o comentário como JSON', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue({ id: 1 });

        await ascentService.addComment(1, 'Bom encadeamento!');

        expect(api.apiFetch).toHaveBeenCalledWith('/ascents/1/comments', {
            method: 'POST',
            body: JSON.stringify({ text: 'Bom encadeamento!' }),
        });
    });
});