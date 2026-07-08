import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FreeLogScreen from '../../../screens/Logbook/FreeLogScreen';
import * as ascentService from '../../../services/ascentService';

// Mocks
jest.mock('../../../services/ascentService');
jest.spyOn(Alert, 'alert');

const mockedLogFreelog = ascentService.logFreelog as jest.Mock;

describe('FreeLogScreen - Testes Estáveis', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('submits gym log correctly with all fields', async () => {
        mockedLogFreelog.mockResolvedValueOnce({ success: true });
        const { getByPlaceholderText, getByText } = render(<FreeLogScreen route={{ params: {} }} />);

        fireEvent.changeText(getByPlaceholderText('e.g., 7a, V6, Blue...'), '6a');
        fireEvent.changeText(getByPlaceholderText('e.g., Vertigo, 9.8 Gravity...'), 'My Gym');

        await act(async () => {
            fireEvent.press(getByText('Save to Logbook'));
        });

        expect(mockedLogFreelog).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('Logged!', expect.any(String), expect.any(Array));
    });

    it('shows alert if grade is missing', async () => {
        const { getByText } = render(<FreeLogScreen route={{ params: {} }} />);

        await act(async () => {
            fireEvent.press(getByText('Save to Logbook'));
        });

        expect(Alert.alert).toHaveBeenCalledWith('Missing grade', expect.any(String));
    });

    it('toggles modes correctly', () => {
        const { getByText, queryByPlaceholderText } = render(<FreeLogScreen route={{ params: {} }} />);

        fireEvent.press(getByText('⛰️ Outdoor Rock'));

        expect(queryByPlaceholderText('e.g., Sintra')).toBeTruthy();
        expect(queryByPlaceholderText('e.g., Vertigo, 9.8 Gravity...')).toBeNull();
    });
});