import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FollowListScreen from '../../../screens/Profile/FollowListScreen';
import * as socialService from '../../../services/socialService';

jest.mock('../../../services/socialService');

const mockUsers = [
    { id: 1, username: 'climber1', isFollowing: false, avatarUrl: null },
    { id: 2, username: 'climber2', isFollowing: true, avatarUrl: null }
];

describe('FollowListScreen - Funcionalidade de Social', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (socialService.getFollowers as jest.Mock).mockResolvedValue(mockUsers);
        (socialService.getFollowing as jest.Mock).mockResolvedValue([]);
    });

    it('deve carregar e mostrar a lista de seguidores', async () => {
        const route = { params: { userId: 123, initialTab: 'followers' } };

        const screen = render(<FollowListScreen route={route} />);

        await waitFor(() => expect(socialService.getFollowers).toHaveBeenCalledWith(123));
        expect(screen.getByText('@climber1')).toBeTruthy();
    });

    it('deve realizar follow de forma otimista', async () => {
        const route = { params: { userId: 123, initialTab: 'followers' } };
        const screen = render(<FollowListScreen route={route} />);

        const followButtons = await screen.findAllByText('Follow');

        fireEvent.press(followButtons[0]);

        const followingButtons = screen.getAllByText('Following');
        expect(followingButtons.length).toBeGreaterThan(0);

        expect(socialService.followUser).toHaveBeenCalledWith(1);
    });
});