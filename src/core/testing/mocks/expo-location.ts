// src/core/testing/mocks/expo-location.ts

export const requestForegroundPermissionsAsync = jest.fn(() => Promise.resolve({ status: "granted" }));
export const requestBackgroundPermissionsAsync = jest.fn(() => Promise.resolve({ status: "granted" }));
export const getCurrentPositionAsync = jest.fn(() => Promise.resolve({ coords: { latitude: 37.7749, longitude: -122.4194 } }));
export const startLocationUpdatesAsync = jest.fn(() => Promise.resolve());
export const stopLocationUpdatesAsync = jest.fn(() => Promise.resolve());
export const hasStartedLocationUpdatesAsync = jest.fn(() => Promise.resolve(false));
export const geocodeAsync = jest.fn(() => Promise.resolve([]));
export const reverseGeocodeAsync = jest.fn(() => Promise.resolve([]));

export enum Accuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
}
