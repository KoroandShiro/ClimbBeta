// src/__tests__/services/authService.test.ts
import { login, register, getMe, verifyCode } from '../../services/authService';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('deve retornar um token quando login é bem-sucedido', async () => {
            const mockToken = 'test-token-123';
            (api.apiFetch as jest.Mock).mockResolvedValue({ token: mockToken });

            const token = await login('user@test.com', 'password123');

            expect(token).toBe(mockToken);
            expect(api.apiFetch).toHaveBeenCalledWith('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email: 'user@test.com', passwordRaw: 'password123' }),
            });
        });

        it('deve lançar erro quando login falha', async () => {
            (api.apiFetch as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

            await expect(login('user@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('deve retornar o perfil do utilizador quando registro é bem-sucedido', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                role: 'GYM_OWNER',
                status: 'PENDING' as const,
            };
            (api.apiFetch as jest.Mock).mockResolvedValue(mockUser);

            const user = await register('testuser', 'test@test.com', 'SecurePass123!', 'GYM_OWNER');

            expect(user).toEqual(mockUser);
            expect(api.apiFetch).toHaveBeenCalledWith('/users/register', {
                method: 'POST',
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@test.com',
                    passwordRaw: 'SecurePass123!',
                    role: 'GYM_OWNER',
                }),
            });
        });
    });

    describe('getMe', () => {
        it('deve retornar o perfil do utilizador autenticado', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                role: 'GYM_OWNER',
                status: 'VERIFIED' as const,
            };
            (api.apiFetch as jest.Mock).mockResolvedValue(mockUser);

            const user = await getMe();

            expect(user).toEqual(mockUser);
            expect(api.apiFetch).toHaveBeenCalledWith('/users/me');
        });
    });

    describe('verifyCode', () => {
        it('deve verificar um código de ativação', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                role: 'GYM_OWNER',
                status: 'VERIFIED' as const,
            };
            (api.apiFetch as jest.Mock).mockResolvedValue(mockUser);

            const user = await verifyCode('ABC123');

            expect(user).toEqual(mockUser);
            expect(api.apiFetch).toHaveBeenCalledWith('/users/verify-code', {
                method: 'POST',
                body: JSON.stringify({ code: 'ABC123' }),
            });
        });
    });
});