// src/core/testing/mocks/expo-audio.ts

export const createAudioPlayer = jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    addListener: jest.fn(),
    loop: false,
    volume: 1,
}));

export const setAudioModeAsync = jest.fn(() => Promise.resolve());
