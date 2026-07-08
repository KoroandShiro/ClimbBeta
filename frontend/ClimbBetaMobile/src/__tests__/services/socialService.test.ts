import * as api from '../../services/api';
import * as socialService from '../../services/socialService';

jest.mock('../../services/api');

describe('socialService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('searchUsers deve encodar a query corretamente', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        const query = 'john doe';

        await socialService.searchUsers(query);

        // Verifica se a URL contém a query encodada
        expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('q=john%20doe'));
    });

    it('followUser deve chamar apiFetch com POST', async () => {
        await socialService.followUser(123);
        expect(api.apiFetch).toHaveBeenCalledWith('/climbers/123/follow', { method: 'POST' });
    });

    it('unfollowUser deve chamar apiFetch com DELETE', async () => {
        await socialService.unfollowUser(123);
        expect(api.apiFetch).toHaveBeenCalledWith('/climbers/123/follow', { method: 'DELETE' });
    });

    it('getFollowers deve chamar o endpoint correto', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        await socialService.getFollowers(123);
        expect(api.apiFetch).toHaveBeenCalledWith('/climbers/123/followers');
    });

    it('getFollowing deve chamar o endpoint correto', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        await socialService.getFollowing(123);
        expect(api.apiFetch).toHaveBeenCalledWith('/climbers/123/following');
    });
});