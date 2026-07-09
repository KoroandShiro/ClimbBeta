// src/__tests__/components/ActivationWallCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivationWallCard from '../../components/ActivationWallCard';
import * as authService from '../../services/authService';
import { AuthProvider } from '../../contexts/AuthContext';

jest.mock('../../services/authService');

describe('ActivationWallCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar o card de ativação', () => {
        render(
            <AuthProvider>
                <ActivationWallCard />
            </AuthProvider>
        );

        expect(screen.getByText('Account pending activation')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Activation code')).toBeInTheDocument();
    });

    it('deve mostrar erro quando o código é inválido', async () => {
        (authService.verifyCode as jest.Mock).mockRejectedValue(new Error('Invalid code'));

        render(
            <AuthProvider>
                <ActivationWallCard />
            </AuthProvider>
        );

        const input = screen.getByPlaceholderText('Activation code');
        const button = screen.getByText('Activate account');

        fireEvent.change(input, { target: { value: 'WRONG' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Invalid code/)).toBeInTheDocument();
        });
    });

    it('deve chamar verifyCode quando o formulário é enviado', async () => {
        (authService.verifyCode as jest.Mock).mockResolvedValue({
            id: 1,
            username: 'user',
            email: 'user@test.com',
            role: 'GYM_OWNER',
            status: 'VERIFIED',
        });

        render(
            <AuthProvider>
                <ActivationWallCard />
            </AuthProvider>
        );

        const input = screen.getByPlaceholderText('Activation code');
        const button = screen.getByText('Activate account');

        fireEvent.change(input, { target: { value: 'CORRECT123' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(authService.verifyCode).toHaveBeenCalledWith('CORRECT123');
        });
    });
});