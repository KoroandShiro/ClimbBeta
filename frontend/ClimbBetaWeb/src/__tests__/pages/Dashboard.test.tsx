// src/__tests__/pages/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import * as gymService from '../../services/gymService';

jest.mock('../../services/gymService');

describe('Dashboard', () => {
    const mockUser = {
        id: 1,
        username: 'testowner',
        email: 'test@gym.com',
        role: 'GYM_OWNER',
        status: 'VERIFIED' as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('climbbeta_token', 'test-token');
        localStorage.setItem('climbbeta_user', JSON.stringify(mockUser));
    });

    it('deve carregar e exibir os ginásios do utilizador', async () => {
        const mockGyms = [
            {
                id: 1,
                ownerId: 1,
                name: 'Test Gym',
                address: 'Street 1',
                city: 'Lisbon',
                coverImageUrl: null,
            },
        ];

        (gymService.getGyms as jest.Mock).mockResolvedValue(mockGyms);

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Gym')).toBeInTheDocument();
        });
    });

    it('deve mostrar mensagem de carregamento inicialmente', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText(/Loading your empire/)).toBeInTheDocument();
    });

    it('deve mostrar card de ativação se o utilizador estiver PENDING', async () => {
        const pendingUser = { ...mockUser, status: 'PENDING' as const };
        localStorage.setItem('climbbeta_user', JSON.stringify(pendingUser));

        (gymService.getGyms as jest.Mock).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Account pending activation')).toBeInTheDocument();
        });
    });
});