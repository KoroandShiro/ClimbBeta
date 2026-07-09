// src/__tests__/pages/Register.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../pages/Register';
import { AuthProvider } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('Register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('deve renderizar o formulário de registo', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Register />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Vertigo/)).toBeInTheDocument();
    });

    it('deve validar a força da password', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Register />
                </AuthProvider>
            </BrowserRouter>
        );

        const passwordInput = screen.getByPlaceholderText('Create a strong password');

        fireEvent.change(passwordInput, { target: { value: 'Weak' } });

        expect(screen.getByText('8 to 64 characters')).not.toHaveClass('ok');
    });

    it('deve mostrar erro quando as passwords não correspondem', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Register />
                </AuthProvider>
            </BrowserRouter>
        );

        const passwordInput = screen.getByPlaceholderText('Create a strong password');
        const confirmInput = screen.getByPlaceholderText('Repeat your password');

        fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
        fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });

        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });

    it('deve registar um utilizador com dados válidos', async () => {
        (authService.register as jest.Mock).mockResolvedValue({
            id: 1,
            username: 'newuser',
            email: 'new@test.com',
            role: 'GYM_OWNER',
            status: 'PENDING',
        });

        window.alert = jest.fn();

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Register />
                </AuthProvider>
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Vertigo/), {
            target: { value: 'NewGym' },
        });
        fireEvent.change(screen.getByPlaceholderText('you@yourgym.com'), {
            target: { value: 'new@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
            target: { value: 'ValidPass123!' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat your password'), {
            target: { value: 'ValidPass123!' },
        });

        fireEvent.click(screen.getByText('Create account'));

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalledWith(
                'NewGym',
                'new@test.com',
                'ValidPass123!',
                'GYM_OWNER'
            );
        });
    });
});