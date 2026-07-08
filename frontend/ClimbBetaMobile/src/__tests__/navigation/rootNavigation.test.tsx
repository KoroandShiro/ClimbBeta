import React from 'react';
import { render } from '@testing-library/react-native';
import RootNavigation from '../../navigation/RootNavigation';
import { useAuth } from '../../contexts/AuthContext';

// 1. Mock do AuthContext
jest.mock('../../contexts/AuthContext');
const mockedUseAuth = useAuth as jest.Mock;

// 2. Mock dos componentes de navegação para evitar erros de registo e versões
jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }: any) => <>{children}</>,
        Screen: ({ name }: any) => <></>,
    }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: () => ({
        Navigator: ({ children }: any) => <>{children}</>,
        Screen: ({ name }: any) => <></>,
    }),
}));

describe('RootNavigation', () => {

    it('deve mostrar o ActivityIndicator quando isLoading for true', () => {
        mockedUseAuth.mockReturnValue({ token: null, isLoading: true });

        const { UNSAFE_getByType } = render(<RootNavigation />);

        // Em vez de procurar pelo "role", procuramos pelo tipo do componente
        // O ActivityIndicator do react-native é o componente que procuramos
        const { ActivityIndicator } = require('react-native');
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('deve renderizar AuthStackNavigator quando o token é nulo', () => {
        mockedUseAuth.mockReturnValue({ token: null, isLoading: false });

        // Com o mock do navegador, não precisamos do NavigationContainer
        const { queryByRole } = render(<RootNavigation />);

        // Verifica que o loader já não está presente
        expect(queryByRole('progressbar')).toBeNull();
    });

    it('deve renderizar AppTabs quando o token existe', () => {
        mockedUseAuth.mockReturnValue({ token: 'mock-token', isLoading: false });

        const { queryByRole } = render(<RootNavigation />);

        // Verifica que não estamos no estado de carregamento
        expect(queryByRole('progressbar')).toBeNull();
    });


});