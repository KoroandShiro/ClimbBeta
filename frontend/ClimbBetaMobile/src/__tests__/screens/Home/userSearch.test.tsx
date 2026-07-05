import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import UserSearchScreen from '../../../screens/Home/UserSearchScreen';
import * as socialService from '../../../services/socialService';

// Mocks
jest.mock('../../../services/socialService');
const mockedSearchUsers = socialService.searchUsers as jest.Mock;
const mockedFollow = socialService.followUser as jest.Mock;

describe('UserSearchScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('deve realizar busca após o debounce', async () => {
        const mockUsers = [{ id: 1, username: 'climber1', isFollowing: false }];
        mockedSearchUsers.mockResolvedValueOnce(mockUsers);

        const { getByPlaceholderText, findByText } = render(<UserSearchScreen />);

        const input = getByPlaceholderText('Search climbers...');
        fireEvent.changeText(input, 'climber1');

        // Avança o tempo para disparar o debounce de 500ms
        act(() => {
            jest.advanceTimersByTime(500);
        });

        const user = await findByText('@climber1');
        expect(user).toBeTruthy();
        expect(mockedSearchUsers).toHaveBeenCalledWith('climber1');
    });

    it('deve realizar atualização otimista ao clicar em follow', async () => {
        const mockUsers = [{ id: 1, username: 'climber1', isFollowing: false }];
        mockedSearchUsers.mockResolvedValueOnce(mockUsers);
        mockedFollow.mockResolvedValueOnce({});

        const { getByPlaceholderText, getByText } = render(<UserSearchScreen />);

        // Disparar busca
        fireEvent.changeText(getByPlaceholderText('Search climbers...'), 'climber1');
        act(() => { jest.advanceTimersByTime(500); });

        await waitFor(() => expect(getByText('Follow')).toBeTruthy());

        // Clicar em Follow
        fireEvent.press(getByText('Follow'));

        // Verifica estado otimista imediato
        expect(getByText('Following')).toBeTruthy();
        expect(mockedFollow).toHaveBeenCalledWith(1);
    });

    it('deve reverter o estado se a API falhar', async () => {
        const mockUsers = [{ id: 1, username: 'climber1', isFollowing: false }];
        mockedSearchUsers.mockResolvedValueOnce(mockUsers);
        // Simula uma falha na API
        mockedFollow.mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByText, queryByText } = render(<UserSearchScreen />);

        fireEvent.changeText(getByPlaceholderText('Search climbers...'), 'climber1');
        act(() => { jest.advanceTimersByTime(500); });

        await waitFor(() => expect(getByText('Follow')).toBeTruthy());

        // Clica em Follow
        fireEvent.press(getByText('Follow'));

        // Verifica se mudou para 'Following' otimisticamente
        expect(getByText('Following')).toBeTruthy();

        // Aguarda o erro ser processado e o estado reverter
        await waitFor(() => {
            expect(queryByText('Following')).toBeNull(); // Otimista desapareceu
            expect(getByText('Follow')).toBeTruthy();    // Voltou ao original
        });
    });
});