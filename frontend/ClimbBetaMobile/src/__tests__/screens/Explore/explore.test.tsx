import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ExploreScreen from '../../../screens/Explore/ExploreScreen';
import * as gymService from '../../../services/gymService';

// Mock do serviço
jest.mock('../../../services/gymService');

// Mantemos o mock do navigation para evitar problemas de navegação real
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({ navigate: jest.fn() }),
    };
});

describe('ExploreScreen', () => {
    const mockGyms = [
        { id: '1', name: 'Climb Center A', city: 'Lisbon', coverImageUrl: '' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Função helper para envolver o componente
    const renderWithNavigation = (ui: React.ReactElement) => {
        return render(<NavigationContainer>{ui}</NavigationContainer>);
    };

    it('deve carregar e exibir ginásios corretamente', async () => {
        (gymService.getGyms as jest.Mock).mockResolvedValue(mockGyms);

        renderWithNavigation(<ExploreScreen />);

        // findByText resolve automaticamente o act pois aguarda a renderização assíncrona
        const gymName = await screen.findByText('Climb Center A');

        expect(gymName).toBeTruthy();
    });

    it('deve filtrar os resultados na pesquisa', async () => {
        (gymService.getGyms as jest.Mock).mockResolvedValue(mockGyms);

        renderWithNavigation(<ExploreScreen />);

        // Aguarda o carregamento inicial
        await screen.findByText('Climb Center A');

        const searchInput = screen.getByPlaceholderText(/Search gyms/i);
        fireEvent.changeText(searchInput, 'Climb Center A');

        expect(screen.getByText('Climb Center A')).toBeTruthy();
    });

    it('deve navegar para a tela de detalhes ao clicar num ginásio', async () => {
        const mockNavigate = jest.fn();
        (gymService.getGyms as jest.Mock).mockResolvedValue(mockGyms);

        // Sobrescrevemos o mock para capturar a função navigate
        const { getByText } = renderWithNavigation(<ExploreScreen navigation={{ navigate: mockNavigate }} />);

        await screen.findByText('Climb Center A');

        const card = getByText('Climb Center A');
        fireEvent.press(card);

        expect(mockNavigate).toHaveBeenCalledWith('GymDetails', {
            gymId: '1',
            gymName: 'Climb Center A',
        });
    });
});