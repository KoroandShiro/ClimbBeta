import * as api from '../../services/api';
import * as gymService from '../../services/gymService';

jest.mock('../../services/api');

describe('gymService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getGyms deve chamar apiFetch para /gyms', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        await gymService.getGyms();
        expect(api.apiFetch).toHaveBeenCalledWith('/gyms');
    });

    it('getActiveBoulders deve chamar apiFetch para a rota correta do ginásio', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        await gymService.getActiveBoulders(5);
        expect(api.apiFetch).toHaveBeenCalledWith('/gyms/5/boulders');
    });

    it('getBoulderById deve chamar apiFetch para o boulder específico', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue({ id: 1 });
        await gymService.getBoulderById(1);
        expect(api.apiFetch).toHaveBeenCalledWith('/boulders/1');
    });

    it('getLeaderboard deve chamar apiFetch para o leaderboard do boulder', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        await gymService.getLeaderboard(1);
        expect(api.apiFetch).toHaveBeenCalledWith('/boulders/1/leaderboard');
    });

    it('saveProject deve enviar um POST para salvar o projeto', async () => {
        await gymService.saveProject(10);
        expect(api.apiFetch).toHaveBeenCalledWith('/boulders/10/save', { method: 'POST' });
    });

    it('unsaveProject deve enviar um DELETE para remover o projeto', async () => {
        await gymService.unsaveProject(10);
        expect(api.apiFetch).toHaveBeenCalledWith('/boulders/10/save', { method: 'DELETE' });
    });

    it('checkSaveStatus deve chamar o endpoint de status', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue({ isSaved: true });
        const result = await gymService.checkSaveStatus(10);
        expect(result.isSaved).toBe(true);
        expect(api.apiFetch).toHaveBeenCalledWith('/boulders/10/save-status');
    });
});