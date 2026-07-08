import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

// "Mock" dos serviços para isolar o contexto
jest.mock('../../services/authService');

describe('AuthContext', () => {
    const mockedAuthService = authService as jest.Mocked<typeof authService>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Configuração predefinida para garantir que as promessas não falham
        mockedAuthService.logout.mockResolvedValue(undefined);
        mockedAuthService.getStoredToken.mockResolvedValue(null);
        mockedAuthService.login.mockResolvedValue(undefined);
    });

    it('deve lançar erro se o "useAuth" for usado fora do provedor', () => {
        // Silenciamos o erro no console, pois esperamos que ele ocorra
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside AuthProvider');

        spy.mockRestore();
    });

    it('deve atualizar o "token" após o início de sessão (login)', async () => {
        const mockToken = 'fake-jwt-token';
        mockedAuthService.getStoredToken.mockResolvedValue(mockToken);

        // O "wrapper" garante que o "hook" tem acesso ao provedor
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Aguardamos que o "useEffect" inicial termine antes de realizar a ação
        await act(async () => {
            await result.current.login('test@test.com', 'password');
        });

        expect(mockedAuthService.login).toHaveBeenCalledWith('test@test.com', 'password');
        expect(result.current.token).toBe(mockToken);
    });

    it('deve limpar o "token" após o termo de sessão (logout)', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockedAuthService.logout).toHaveBeenCalled();
        expect(result.current.token).toBeNull();
    });

    it('deve definir "isLoading" como falso após a inicialização', async () => {
        // Definimos um tempo de resposta para o mock para simular o carregamento
        mockedAuthService.getStoredToken.mockResolvedValue('some-token');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Inicialmente, o estado de carregamento deve ser verdadeiro
        expect(result.current.isLoading).toBe(true);

        // Aguardamos que o useEffect termine
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Agora o carregamento deve estar concluído
        expect(result.current.isLoading).toBe(false);
    });
});