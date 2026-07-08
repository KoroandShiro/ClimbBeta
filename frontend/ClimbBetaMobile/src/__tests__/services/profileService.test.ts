import * as api from '../../services/api';
import * as profileService from '../../services/profileService';

jest.mock('../../services/api');

describe('profileService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getMyProfile deve chamar apiFetch para /profiles/me', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue({ username: 'climber1' });
        const result = await profileService.getMyProfile();

        expect(api.apiFetch).toHaveBeenCalledWith('/profiles/me');
        expect(result.username).toBe('climber1');
    });

    it('updateMyProfile deve chamar apiFetch com PUT e o payload correto', async () => {
        const input = { bio: 'Amo escalar!' };
        (api.apiFetch as jest.Mock).mockResolvedValue({ bio: 'Amo escalar!' });

        await profileService.updateMyProfile(input);

        expect(api.apiFetch).toHaveBeenCalledWith('/profiles/me', {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    });

    it('getMySavedProjects deve chamar apiFetch para a rota de projetos', async () => {
        (api.apiFetch as jest.Mock).mockResolvedValue([]);
        await profileService.getMySavedProjects();
        expect(api.apiFetch).toHaveBeenCalledWith('/profiles/me/projects');
    });

    it('uploadMyAvatar deve chamar apiFetch com FormData', async () => {
        const formData = new FormData();
        (api.apiFetch as jest.Mock).mockResolvedValue({ avatarUrl: 'http://cdn.com/avatar.jpg' });

        await profileService.uploadMyAvatar(formData);

        expect(api.apiFetch).toHaveBeenCalledWith('/profiles/me/avatar', {
            method: 'POST',
            body: formData,
        });
    });
});