import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateGymModal from '../../components/CreateGymModal';
import * as gymService from '../../services/gymService';
import { AuthProvider } from '../../contexts/AuthContext';

jest.mock('../../services/gymService');

describe('CreateGymModal', () => {
    const mockProps = {
        onCreated: jest.fn(),
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('climbbeta_token', 'test-token');
        localStorage.setItem(
            'climbbeta_user',
            JSON.stringify({
                id: 1,
                username: 'testowner',
                email: 'test@gym.com',
                role: 'GYM_OWNER',
                status: 'VERIFIED',
            })
        );
    });

    it('deve renderizar o modal corretamente', () => {
        render(
            <AuthProvider>
                <CreateGymModal {...mockProps} />
            </AuthProvider>
        );

        expect(screen.getByText('Add gym')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. Climbing Factory Lisbon')).toBeInTheDocument();
    });

    it('deve chamar onClose quando o botão de fechar é clicado', () => {
        render(
            <AuthProvider>
                <CreateGymModal {...mockProps} />
            </AuthProvider>
        );

        fireEvent.click(screen.getByLabelText('Close'));

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('deve criar um ginásio e chamar onCreated', async () => {
        (gymService.createGym as jest.Mock).mockResolvedValue({
            id: 1,
            ownerId: 1,
            name: 'New Gym',
            address: 'Street 1',
            city: 'Lisbon',
            coverImageUrl: null,
        });

        render(
            <AuthProvider>
                <CreateGymModal {...mockProps} />
            </AuthProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('e.g. Climbing Factory Lisbon'), {
            target: { value: 'New Gym' },
        });
        fireEvent.change(screen.getByPlaceholderText('Street, number…'), {
            target: { value: 'Street 1' },
        });
        fireEvent.change(screen.getByPlaceholderText('e.g. Lisbon, Porto…'), {
            target: { value: 'Lisbon' },
        });

        fireEvent.click(screen.getByText('Create gym'));

        await waitFor(() => {
            expect(mockProps.onCreated).toHaveBeenCalled();
        });
    });
});