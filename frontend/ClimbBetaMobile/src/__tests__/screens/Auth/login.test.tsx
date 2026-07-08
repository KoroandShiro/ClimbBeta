import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '../../../screens/Auth/LoginScreen';
import { AuthContext } from '../../../contexts/AuthContext';
import { ApiError } from '../../../services/api';

const mockLogin = jest.fn();

const renderWithAuth = (ui: React.ReactElement) => {
    return render(
        <AuthContext.Provider value={{ token: null, isLoading: false, login: mockLogin, logout: jest.fn() }}>
            {ui}
        </AuthContext.Provider>
    );
};

describe('LoginScreen Integration', () => {
    // Limpa os mocks antes de cada teste
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve chamar login com credenciais corretas', async () => {
        mockLogin.mockResolvedValueOnce(undefined);
        const navigation = { navigate: jest.fn() };
        const { getByPlaceholderText, getByText } = renderWithAuth(<LoginScreen navigation={navigation} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'climber@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'secret123');

        await act(async () => {
            fireEvent.press(getByText('Log In'));
        });

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('climber@test.com', 'secret123');
        });
    });

    it('deve exibir mensagem de erro específica para 401 Unauthorized', async () => {
        // Silencia o console.error apenas para este teste
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockLogin.mockRejectedValueOnce(new ApiError('Unauthorized', 401));

        const { getByPlaceholderText, getByText } = renderWithAuth(<LoginScreen navigation={{ navigate: jest.fn() }} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');

        await act(async () => {
            fireEvent.press(getByText('Log In'));
        });

        await waitFor(() => {
            expect(getByText('Incorrect email or password.')).toBeTruthy();
        });

        consoleSpy.mockRestore(); // Restaura a consola original
    });

    it('deve exibir mensagem de erro se os campos estiverem vazios', async () => {
        const { getByText } = renderWithAuth(<LoginScreen navigation={{ navigate: jest.fn() }} />);

        fireEvent.press(getByText('Log In'));

        expect(getByText('Please fill in both email and password.')).toBeTruthy();
    });

    it('deve exibir mensagem de erro genérica para erros diferentes de 401', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockLogin.mockRejectedValueOnce(new ApiError('Server Error', 500));

        const { getByPlaceholderText, getByText } = renderWithAuth(<LoginScreen navigation={{ navigate: jest.fn() }} />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('Password'), '123');

        // Envolver o press num act para garantir que a atualização de estado (loading/error) é processada
        await act(async () => {
            fireEvent.press(getByText('Log In'));
        });

        await waitFor(() => {
            expect(getByText('Could not connect to the server. Please try again.')).toBeTruthy();
        });

        consoleSpy.mockRestore();
    });

    it('deve navegar para a tela de registro ao clicar em Sign Up', () => {
        const mockNavigate = jest.fn();
        const { getByText } = renderWithAuth(<LoginScreen navigation={{ navigate: mockNavigate }} />);

        // Procura o texto que contém "Sign Up"
        const signUpLink = getByText(/Sign Up/i);

        fireEvent.press(signUpLink);

        // Verifica se a função de navegação foi chamada com a rota correta
        expect(mockNavigate).toHaveBeenCalledWith('Register');
    });
});