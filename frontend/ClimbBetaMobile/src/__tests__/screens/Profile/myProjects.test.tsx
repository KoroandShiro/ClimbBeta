import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import MyProjectsScreen from '../../../screens/Profile/MyProjectsScreen';
import * as profileService from '../../../services/profileService';

// 1. Mock do serviço
jest.mock('../../../services/profileService');

// 2. Mock da navegação e do efeito de foco
// IMPORTANTE: Variáveis de mock devem começar com "mock" para serem aceites pelo Jest factory
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: any) => setTimeout(cb, 0),
}));

describe('MyProjectsScreen - Gestão de Projetos', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve exibir a lista de projetos carregados', async () => {
        const mockProjects = [
            { id: 1, gymId: 10, color: 'Blue', grade: '6A', imageUrl: 'http://test.com/img.jpg' }
        ];
        (profileService.getMySavedProjects as jest.Mock).mockResolvedValue(mockProjects);

        const screen = render(<MyProjectsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Route Blue')).toBeTruthy();
            expect(screen.getByText('6A')).toBeTruthy();
        });
    });

    it('deve exibir contador correto de projetos', async () => {
        const mockProjects = [
            { id: 1, gymId: 1, color: 'Red', grade: '6B' },
            { id: 2, gymId: 1, color: 'Green', grade: '7A' }
        ];
        (profileService.getMySavedProjects as jest.Mock).mockResolvedValue(mockProjects);

        const screen = render(<MyProjectsScreen />);

        await waitFor(() => {
            expect(screen.getByText(/You have 2 pending routes/)).toBeTruthy();
        });
    });

    it('deve navegar para a tela de detalhes ao clicar num projeto', async () => {
        const mockProjects = [
            { id: 1, gymId: 10, color: 'Blue', grade: '6A' }
        ];
        (profileService.getMySavedProjects as jest.Mock).mockResolvedValue(mockProjects);

        const screen = render(<MyProjectsScreen />);

        // Aguarda o carregamento e encontra o card
        const card = await waitFor(() => screen.getByText('Route Blue'));

        // Simula o clique no card
        fireEvent.press(card);

        // Verifica a navegação
        expect(mockNavigate).toHaveBeenCalledWith('Explore', {
            screen: 'BoulderDetails',
            params: { boulderId: 1, gymId: 10 }
        });
    });

    it('deve exibir erro no console se a requisição falhar', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (profileService.getMySavedProjects as jest.Mock).mockRejectedValue(new Error('API Error'));

        render(<MyProjectsScreen />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error loading saved projects:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });
});