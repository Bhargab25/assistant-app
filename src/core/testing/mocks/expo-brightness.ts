// src/core/testing/mocks/expo-brightness.ts

export const requestPermissionsAsync = jest.fn(() => Promise.resolve({ status: "granted" }));
export const getBrightnessAsync = jest.fn(() => Promise.resolve(0.5));
export const setBrightnessAsync = jest.fn(() => Promise.resolve());
export const getSystemBrightnessAsync = jest.fn(() => Promise.resolve(0.5));
export const setSystemBrightnessAsync = jest.fn(() => Promise.resolve());
export const useSystemBrightnessAsync = jest.fn(() => Promise.resolve());
export const isSystemBrightnessLockedAsync = jest.fn(() => Promise.resolve(false));
