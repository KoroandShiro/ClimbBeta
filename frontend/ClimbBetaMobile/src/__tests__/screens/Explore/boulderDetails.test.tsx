import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import BoulderDetailsScreen from '../../../screens/Explore/BoulderDetailsScreen';
import * as gymService from '../../../services/gymService';

// Mock do serviço e do Alert
jest.mock('../../../services/gymService');
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useRoute: () => ({ params: { boulderId: 'b1' } }),
    useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
}));

describe('BoulderDetailsScreen', () => {
    const mockBoulder = { id: 'b1', grade: 'V4', color: 'Red', setterName: 'John', gymId: 'g1' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderScreen = () => render(<NavigationContainer><BoulderDetailsScreen /></NavigationContainer>);

    it('deve carregar e exibir os detalhes do boulder', async () => {
        (gymService.getBoulderById as jest.Mock).mockResolvedValue(mockBoulder);
        (gymService.getLeaderboard as jest.Mock).mockResolvedValue([]);
        (gymService.checkSaveStatus as jest.Mock).mockResolvedValue({ isSaved: false });

        renderScreen();

        expect(await screen.findByText(/Route Red/i)).toBeTruthy();
        expect(await screen.findByText('V4')).toBeTruthy();
    });

    it('deve exibir "Route not found" se o carregamento falhar', async () => {
        (gymService.getBoulderById as jest.Mock).mockRejectedValue(new Error('API Error'));

        renderScreen();

        expect(await screen.findByText(/Route not found/i)).toBeTruthy();
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Could not load the route details.");
    });
});