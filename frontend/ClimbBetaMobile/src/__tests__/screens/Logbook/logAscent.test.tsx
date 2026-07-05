import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert, TouchableOpacity } from 'react-native';
import LogAscentScreen from '../../../screens/Logbook/LogAscentScreen';
import * as ascentService from '../../../services/ascentService';
import * as gymService from '../../../services/gymService';

// Mocks
jest.mock('../../../services/ascentService');
jest.mock('../../../services/gymService');
jest.spyOn(Alert, 'alert');

const mockedLogAscent = ascentService.logAscent as jest.Mock;
const mockedCheckSaveStatus = gymService.checkSaveStatus as jest.Mock;

describe('LogAscentScreen', () => {
    const defaultRoute = { params: { boulderId: '123', boulderColor: 'Blue' } };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('submits ascent and shows success alert when not saved in projects', async () => {
        mockedLogAscent.mockResolvedValueOnce({});
        mockedCheckSaveStatus.mockResolvedValueOnce({ isSaved: false });

        const { getByText } = render(<LogAscentScreen route={defaultRoute} />);

        await act(async () => {
            fireEvent.press(getByText('Save to Logbook'));
        });

        expect(mockedLogAscent).toHaveBeenCalledWith(expect.objectContaining({ boulderId: '123' }));
        expect(Alert.alert).toHaveBeenCalledWith("Success!", expect.stringContaining("logged"), expect.any(Array));
    });

    it('shows confirmation to remove from projects if boulder was saved', async () => {
        mockedLogAscent.mockResolvedValueOnce({});
        mockedCheckSaveStatus.mockResolvedValueOnce({ isSaved: true });

        const { getByText } = render(<LogAscentScreen route={defaultRoute} />);

        await act(async () => {
            fireEvent.press(getByText('Save to Logbook'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            "Boa subida! 🎉",
            expect.stringContaining("remover"),
            expect.any(Array)
        );
    });
});