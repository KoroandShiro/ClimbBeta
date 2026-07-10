// src/__tests__/pages/Login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthProvider } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('Login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('deve renderizar o formulário de login', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@yourgym.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    });

    it('deve mostrar erro quando login falha', async () => {
        (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('you@yourgym.com'), {
            target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Your password'), {
            target: { value: 'wrongpass' },
        });

        fireEvent.click(screen.getByText('Sign in'));

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
        });
    });

    it('deve chamar login com as credenciais corretas', async () => {
        (authService.login as jest.Mock).mockResolvedValue('test-token');
        (authService.getMe as jest.Mock).mockResolvedValue({
            id: 1,
            username: 'testuser',
            email: 'test@test.com',
            role: 'GYM_OWNER',
            status: 'VERIFIED',
        });

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('you@yourgym.com'), {
            target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Your password'), {
            target: { value: 'ValidPass123!' },
        });

        fireEvent.click(screen.getByText('Sign in'));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@test.com', 'ValidPass123!');
        });
    });
});