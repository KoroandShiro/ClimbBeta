import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AscentDetailsScreen from '../../../screens/Home/AscentDetailsScreen';
import * as ascentService from '../../../services/ascentService';

jest.mock('../../../services/ascentService');

describe('AscentDetailsScreen', () => {
    // 1. Defina o mockRoute fora dos testes para ser reutilizado
    const mockRoute = { params: { ascentId: 123 } };

    const mockDetail = {
        ascent: { notes: 'Great climb!', style: 'Flash' },
        authorUsername: 'ClimberUser',
        routeName: 'The Project',
        routeGrade: 'V5',
        likeCount: 10,
        likedByMe: false,
    };

    const mockComments = [{ id: 1, authorUsername: 'Friend', text: 'Nice send!' }];

    beforeEach(() => {
        jest.clearAllMocks();
        (ascentService.getAscentDetail as jest.Mock).mockResolvedValue(mockDetail);
        (ascentService.getComments as jest.Mock).mockResolvedValue(mockComments);
    });

    it('deve renderizar e carregar dados sem erros', async () => {
        render(
            <NavigationContainer>
                {/* 2. Passar a prop aqui */}
                <AscentDetailsScreen route={mockRoute} />
            </NavigationContainer>
        );

        const title = await screen.findByText(/The Project/i);
        expect(title).toBeTruthy();
    });

    it('deve alternar o like corretamente', async () => {
        render(
            <NavigationContainer>
                {/* 2. Passar a prop aqui também */}
                <AscentDetailsScreen route={mockRoute} />
            </NavigationContainer>
        );

        // Aguarda a renderização inicial
        const likeButton = await screen.findByText('10');

        // Dispara o evento dentro de act()
        await act(async () => {
            fireEvent.press(likeButton);
        });

        // Verifica o estado atualizado (supondo que o componente atualize o número)
        expect(screen.getByText('11')).toBeTruthy();
    });
});