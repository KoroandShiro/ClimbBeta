import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import FeedPostCard from '../../components/FeedPostCard';

describe('FeedPostCard', () => {
    const mockPost = {
        ascent: { id: 1, date: '2026-07-04', style: 'Flash', boulderId: 10 },
        authorUsername: 'climb_pro',
        routeName: 'Wall Master',
        routeGrade: '6A',
        likeCount: 5,
        likedByMe: false,
        logType: 'INDOOR',
        ascentId: 1
    };

    const mockNavigation = { navigate: jest.fn() };
    const mockOnToggleLike = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar o nome do utilizador e da rota corretamente', () => {
        const { getByText } = render(
            <FeedPostCard post={mockPost} navigation={mockNavigation} onToggleLike={mockOnToggleLike} />
        );

        expect(getByText('climb_pro')).toBeTruthy();
        expect(getByText(/Wall Master/i)).toBeTruthy();
        expect(getByText('(6A)')).toBeTruthy();
    });

    it('deve chamar onToggleLike ao clicar no ícone de coração', () => {
        const { UNSAFE_getAllByType } = render(
            <FeedPostCard post={mockPost} navigation={mockNavigation} onToggleLike={mockOnToggleLike} />
        );

        // O TouchableOpacity do Like é o 2º botão na renderização (contando badge, imagem, like, chat)
        // Pela estrutura:
        // 1. Badge (se indoor)
        // 2. Imagem
        // 3. Like (Aqui)
        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        fireEvent.press(touchables[2]);

        expect(mockOnToggleLike).toHaveBeenCalledWith(mockPost.ascent.id, false);
    });

    it('deve navegar para AscentDetails ao clicar na imagem', () => {
        const { UNSAFE_getAllByType } = render(
            <FeedPostCard post={mockPost} navigation={mockNavigation} onToggleLike={mockOnToggleLike} />
        );

        // A imagem é o 2º TouchableOpacity na hierarquia
        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        fireEvent.press(touchables[1]);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('AscentDetails', { ascentId: mockPost.ascent.id });
    });

    it('deve renderizar o badge de Outdoor corretamente', () => {
        const outdoorPost = {
            ...mockPost,
            logType: 'OUTDOOR',
            ascent: { ...mockPost.ascent, boulderId: null }
        };

        const { getAllByText } = render(
            <FeedPostCard post={outdoorPost} navigation={mockNavigation} onToggleLike={mockOnToggleLike} />
        );

        // getAllByText retorna um array. Se o texto aparece mais que uma vez,
        // o teste passa se pelo menos um deles for o que você espera.
        const matches = getAllByText('Outdoor');
        expect(matches.length).toBeGreaterThan(0);
    });
});