import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import RegisterScreen from '../../../screens/Auth/RegisterScreen';
import * as authService from '../../../services/authService';
import { ApiError } from '../../../services/api';

// Mock do serviço de autenticação
jest.mock('../../../services/authService');

describe('RegisterScreen', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve navegar para login após registro com sucesso', async () => {
        (authService.register as jest.Mock).mockResolvedValueOnce({ id: 1 });
        const { getByPlaceholderText, getAllByText } = render(<RegisterScreen navigation={{ navigate: mockNavigate }} />);

        fireEvent.changeText(getByPlaceholderText('Username'), 'newClimber');
        fireEvent.changeText(getByPlaceholderText('Email'), 'new@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        // [1] seleciona o botão, [0] seria o título
        await act(async () => {
            fireEvent.press(getAllByText('Create Account')[1]);
        });

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('Login', { registered: true });
        });
    });

    it('deve exibir erro se as senhas não coincidirem', async () => {
        const { getByPlaceholderText, getByText, getAllByText } = render(<RegisterScreen navigation={{ navigate: jest.fn() }} />);

        fireEvent.changeText(getByPlaceholderText('Username'), 'user');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'diferente');

        fireEvent.press(getAllByText('Create Account')[1]);

        expect(getByText('Passwords do not match.')).toBeTruthy();
    });

    it('deve exibir erro se campos estiverem vazios', async () => {
        const { getByText, getAllByText } = render(<RegisterScreen navigation={{ navigate: jest.fn() }} />);

        fireEvent.press(getAllByText('Create Account')[1]);

        expect(getByText('Please fill in all fields.')).toBeTruthy();
    });

    it('deve exibir erro específico quando email ou username já existem (400)', async () => {
        (authService.register as jest.Mock).mockRejectedValueOnce(new ApiError('Bad Request', 400));

        const { getByPlaceholderText, getByText, getAllByText } = render(<RegisterScreen navigation={{ navigate: jest.fn() }} />);

        fireEvent.changeText(getByPlaceholderText('Username'), 'existingUser');
        fireEvent.changeText(getByPlaceholderText('Email'), 'existing@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'pass123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'pass123');

        await act(async () => {
            fireEvent.press(getAllByText('Create Account')[1]);
        });

        await waitFor(() => {
            expect(getByText('Email or username already in use.')).toBeTruthy();
        });
    });

    it('deve navegar para a tela de login ao clicar em Log in here', () => {
        const { getByText } = render(<RegisterScreen navigation={{ navigate: mockNavigate }} />);

        fireEvent.press(getByText(/Log in here/i));

        expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
});