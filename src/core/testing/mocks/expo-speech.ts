// src/core/testing/mocks/expo-speech.ts

export const speak = jest.fn();
export const stop = jest.fn();
export const isSpeakingAsync = jest.fn(() => Promise.resolve(false));
export const pause = jest.fn();
export const resume = jest.fn();
