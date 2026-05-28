// src/core/testing/mocks/expo-av.ts

export const Audio = {
    Sound: jest.fn().mockImplementation(() => ({
        loadAsync: jest.fn(() => Promise.resolve()),
        unloadAsync: jest.fn(() => Promise.resolve()),
        playAsync: jest.fn(() => Promise.resolve()),
        stopAsync: jest.fn(() => Promise.resolve()),
        setOnPlaybackStatusUpdate: jest.fn(),
    })),
    setIsEnabledAsync: jest.fn(() => Promise.resolve()),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
};

export const InterruptionModeAndroid = {
    DUCK_OTHERS: 2,
};

export const InterruptionModeIOS = {
    DUCK_OTHERS: 2,
};
