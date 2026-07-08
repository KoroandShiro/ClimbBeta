import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from '../../../screens/Profile/ProfileScreen';
import * as profileService from '../../../services/profileService';
import * as ascentService from '../../../services/ascentService';
import { useAuth } from '../../../contexts/AuthContext';

// Mocks
jest.mock('../../../services/profileService');
jest.mock('../../../services/ascentService');
jest.mock('../../../contexts/AuthContext');

describe('ProfileScreen - Cobertura Total', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ logout: jest.fn() });
    });

    it('deve mostrar o ActivityIndicator enquanto carrega', async () => {
        (profileService.getMyProfile as jest.Mock).mockReturnValue(new Promise(() => {}));
        const { UNSAFE_root } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );
        expect(UNSAFE_root.findAllByType('ActivityIndicator').length).toBeGreaterThan(0);
    });

    it('deve carregar e exibir o username com sucesso', async () => {
        const mockProfile = { userId: 1, username: 'ClimberTest' };
        (profileService.getMyProfile as jest.Mock).mockResolvedValue(mockProfile);
        (ascentService.getClimberAscents as jest.Mock).mockResolvedValue([]);

        const { findByText } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );
        expect(await findByText('ClimberTest')).toBeTruthy();
    });

    it('deve navegar para EditProfile ao clicar no botão Edit', async () => {
        (profileService.getMyProfile as jest.Mock).mockResolvedValue({ userId: 1, username: 'User' });
        (ascentService.getClimberAscents as jest.Mock).mockResolvedValue([]);

        const { getByText } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );

        await waitFor(() => expect(getByText('Edit Profile')).toBeTruthy());
        fireEvent.press(getByText('Edit Profile'));
        expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    });

    it('deve chamar o logout ao clicar no botão de logout', async () => {
        const logoutMock = jest.fn();
        (useAuth as jest.Mock).mockReturnValue({ logout: logoutMock });
        (profileService.getMyProfile as jest.Mock).mockResolvedValue({ userId: 1 });

        const { getByText } = render(<NavigationContainer><ProfileScreen navigation={{ navigate: jest.fn() }} /></NavigationContainer>);
        await waitFor(() => fireEvent.press(getByText('Log Out')));
        expect(logoutMock).toHaveBeenCalled();
    });

    it('deve exibir mensagem de erro quando a API falha', async () => {
        (profileService.getMyProfile as jest.Mock).mockRejectedValue(new Error('Erro ao carregar'));
        const { findByText } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );
        expect(await findByText('Erro ao carregar')).toBeTruthy();
    });

    it('deve exibir valores padrão (—) quando os dados do perfil são nulos', async () => {
        (profileService.getMyProfile as jest.Mock).mockResolvedValue({ userId: 1 });

        const { getAllByText } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );
        // Verifica que existem dois campos sem valores (Indoor e Outdoor)
        const defaults = await waitFor(() => getAllByText('—'));
        expect(defaults.length).toBe(2);
    });

    it('deve navegar para FollowList com parâmetros corretos', async () => {
        (profileService.getMyProfile as jest.Mock).mockResolvedValue({ userId: 123 });
        const { getByText } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );
        await waitFor(() => fireEvent.press(getByText('Followers')));
        expect(mockNavigate).toHaveBeenCalledWith('FollowList', { userId: 123, initialTab: 'followers' });
    });

    it('deve renderizar a lista de ascensões quando existem dados', async () => {
        const mockAscents = [{
            ascent: { id: 1, name: 'Via X', date: '2026-07-03' },
            authorUsername: 'User',
            likeCount: 0,
            likedByMe: false
        }];

        (profileService.getMyProfile as jest.Mock).mockResolvedValue({ userId: 1 });
        (ascentService.getClimberAscents as jest.Mock).mockResolvedValue(mockAscents);

        const { findByText } = render(
            <NavigationContainer>
                <ProfileScreen navigation={{ navigate: mockNavigate }} />
            </NavigationContainer>
        );

        // Verifica o cabeçalho primeiro
        expect(await findByText('Latest Ascents')).toBeTruthy();

        // Em vez de procurar apenas por 'Logged', usamos uma Regex case-insensitive
        // ou procuramos um subtexto contido no nó
        expect(await findByText(/Logged/i)).toBeTruthy();
    });
});