import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LogbookEntryScreen from '../../../screens/Logbook/LogbookEntryScreen';

describe('LogbookEntryScreen', () => {
    // 1. Criamos um mock da função navigate
    const mockNavigate = jest.fn();
    const mockNavigation = { navigate: mockNavigate };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve navegar para FreeLog com modo GYM ao clicar em Gym', () => {
        const { getByText } = render(<LogbookEntryScreen navigation={mockNavigation} />);

        // 2. Simulamos o clique
        fireEvent.press(getByText('🏢 Gym (Non-partner)'));

        // 3. Verificamos se a navegação foi chamada com os parâmetros certos
        expect(mockNavigate).toHaveBeenCalledWith('FreeLog', { initialMode: 'GYM' });
    });

    it('deve navegar para FreeLog com modo ROCK ao clicar em Rock', () => {
        const { getByText } = render(<LogbookEntryScreen navigation={mockNavigation} />);

        fireEvent.press(getByText('⛰️ Rock (Outdoor)'));

        expect(mockNavigate).toHaveBeenCalledWith('FreeLog', { initialMode: 'ROCK' });
    });

    it('deve renderizar o título corretamente', () => {
        const { getByText } = render(<LogbookEntryScreen navigation={mockNavigation} />);
        expect(getByText('New Entry')).toBeTruthy();
    });
});