import * as api from '../../services/api';
import * as authService from '../../services/authService';
import * as SecureStore from 'expo-secure-store';

// Mockar os módulos necessários
jest.mock('../../services/api');
jest.mock('expo-secure-store');

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('login deve chamar apiFetch e guardar o token no SecureStore', async () => {
        const mockToken = 'jwt-token-123';
        (api.apiFetch as jest.Mock).mockResolvedValue({ token: mockToken });

        await authService.login('test@test.com', 'password123');

        // Verifica se a API foi chamada com o endpoint correto
        expect(api.apiFetch).toHaveBeenCalledWith('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@test.com', passwordRaw: 'password123' }),
        });

        // Verifica se o SecureStore foi chamado para persistir o token
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(api.TOKEN_KEY, mockToken);
    });

    it('register deve chamar apiFetch com os dados corretos', async () => {
        const mockUser = { id: 1, username: 'climber1', email: 'c@test.com', role: 'CLIMBER' };
        (api.apiFetch as jest.Mock).mockResolvedValue(mockUser);

        const result = await authService.register('climber1', 'c@test.com', 'pass123');

        expect(api.apiFetch).toHaveBeenCalledWith('/users/register', {
            method: 'POST',
            body: JSON.stringify({ username: 'climber1', email: 'c@test.com', passwordRaw: 'pass123', role: 'CLIMBER' }),
        });
        expect(result).toEqual(mockUser);
    });

    it('logout deve remover o token do SecureStore', async () => {
        await authService.logout();
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(api.TOKEN_KEY);
    });

    it('getStoredToken deve retornar o token do SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-token');

        const token = await authService.getStoredToken();

        expect(SecureStore.getItemAsync).toHaveBeenCalledWith(api.TOKEN_KEY);
        expect(token).toBe('stored-token');
    });
});