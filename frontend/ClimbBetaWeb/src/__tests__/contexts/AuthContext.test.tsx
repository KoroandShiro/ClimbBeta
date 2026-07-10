import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

const TestComponent = () => {
    const { token, user, login, logout } = useAuth();
    return (
        <div>
            <div data-testid="token">{token || 'no-token'}</div>
            <div data-testid="username">{user?.username || 'no-user'}</div>
            <button onClick={() => login('new-token')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('deve restaurar o token e utilizador do localStorage na inicialização', async () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role: 'GYM_OWNER', status: 'VERIFIED' as const };
        localStorage.setItem('climbbeta_token', 'stored-token');
        localStorage.setItem('climbbeta_user', JSON.stringify(mockUser));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
            expect(screen.getByTestId('username')).toHaveTextContent('testuser');
        });
    });

    it('deve fazer login e armazenar token e utilizador', async () => {
        const mockUser = { id: 1, username: 'newuser', email: 'new@test.com', role: 'GYM_OWNER', status: 'PENDING' as const };
        (authService.getMe as jest.Mock).mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByText('Login'));

        await waitFor(() => {
            expect(screen.getByTestId('token')).toHaveTextContent('new-token');
        });

        expect(localStorage.getItem('climbbeta_token')).toBe('new-token');
        expect(JSON.parse(localStorage.getItem('climbbeta_user') || '{}')).toEqual(mockUser);
    });

    it('deve fazer logout e limpar o storage', async () => {
        localStorage.setItem('climbbeta_token', 'old-token');
        localStorage.setItem('climbbeta_user', JSON.stringify({ id: 1, username: 'user' }));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
            expect(screen.getByTestId('token')).toHaveTextContent('no-token');
        });

        expect(localStorage.getItem('climbbeta_token')).toBeNull();
    });
});