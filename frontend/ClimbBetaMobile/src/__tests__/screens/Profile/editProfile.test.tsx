import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import EditProfileScreen from '../../../screens/Profile/EditProfileScreen';
import * as profileService from '../../../services/profileService';
import { Alert } from 'react-native';

// Mocks necessários para o componente
jest.mock('../../../services/profileService');
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: jest.fn() }),
}));
jest.mock('expo-image-picker');

describe('EditProfileScreen - Lógica de Formulario e Gravação', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock padrão para carregar o perfil sem erros
        (profileService.getMyProfile as jest.Mock).mockResolvedValue({
            username: 'ClimberUser',
            email: 'test@test.com',
            bio: 'Old bio',
            height: 170,
            apeIndex: 1.0
        });
    });

    it('deve validar o comprimento mínimo do username (3 caracteres)', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        // Renderiza o componente
        const screen = render(<EditProfileScreen />);

        // Usa findBy... que espera automaticamente até que o elemento apareça no DOM
        // Isto resolve o problema de o componente ainda estar em loading
        const usernameInput = await screen.findByPlaceholderText('Your username');
        const saveButton = screen.getByText('Save');

        fireEvent.changeText(usernameInput, 'Ab');

        // Envolve apenas a ação que dispara o evento
        await act(async () => {
            fireEvent.press(saveButton);
        });

        expect(alertSpy).toHaveBeenCalledWith(
            'Invalid username',
            expect.stringContaining('must be at least 3 characters')
        );
        expect(profileService.updateMyProfile).not.toHaveBeenCalled();
    });

    it('deve formatar valores numéricos (virgula para ponto) e gravar com sucesso', async () => {
        (profileService.updateMyProfile as jest.Mock).mockResolvedValue({});
        const screen = render(<EditProfileScreen />);

        const heightInput = await screen.findByPlaceholderText('e.g., 180');
        const apeInput = await screen.findByPlaceholderText('e.g., 1.04');
        const saveButton = screen.getByText('Save');

        fireEvent.changeText(heightInput, '175');
        fireEvent.changeText(apeInput, '1,05'); // Formatação necessária

        await act(async () => { fireEvent.press(saveButton); });

        expect(profileService.updateMyProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                height: 175,
                apeIndex: 1.05
            })
        );
    });

    it('deve validar valores numéricos inválidos (altura = 0)', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const screen = render(<EditProfileScreen />);

        const heightInput = await screen.findByPlaceholderText('e.g., 180');
        const saveButton = screen.getByText('Save');

        // Como a Regex impede o "-", injetamos "0" que é o valor inválido permitido
        fireEvent.changeText(heightInput, '0');
        await act(async () => { fireEvent.press(saveButton); });

        // Agora o Alert será chamado porque heightVal <= 0
        expect(alertSpy).toHaveBeenCalledWith('Invalid height', expect.any(String));
        expect(profileService.updateMyProfile).not.toHaveBeenCalled();
    });

    it('deve chamar goBack ao clicar no botão Cancel', async () => {
        const mockGoBack = jest.fn();
        // Ajuste do mock para capturar a função goBack
        jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ goBack: mockGoBack });

        const screen = render(<EditProfileScreen />);
        const cancelButton = await screen.findByText('Cancel');

        fireEvent.press(cancelButton);
        expect(mockGoBack).toHaveBeenCalled();
    });
});