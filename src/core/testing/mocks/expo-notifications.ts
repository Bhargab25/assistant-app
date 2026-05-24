// src/core/testing/mocks/expo-notifications.ts

export const setNotificationHandler = jest.fn();

export const setNotificationChannelAsync = jest.fn(async () => {});

export const AndroidImportance = {
  MAX: 5,
};

export const AndroidNotificationVisibility = {
  PUBLIC: 1,
};

export const getPermissionsAsync = jest.fn(async () => ({ granted: true }));

export const requestPermissionsAsync = jest.fn(async () => ({ granted: true }));

export const scheduleNotificationAsync = jest.fn(async () => "mock-notification-id");
