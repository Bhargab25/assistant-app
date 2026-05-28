// src/core/testing/mocks/expo-background-fetch.ts

export enum BackgroundFetchResult {
  NoData = 1,
  NewData = 2,
  Failed = 3,
}

export enum BackgroundFetchStatus {
  Restricted = 1,
  Denied = 2,
  Available = 3,
}

export const registerTaskAsync = jest.fn(() => Promise.resolve());
export const unregisterTaskAsync = jest.fn(() => Promise.resolve());
export const getStatusAsync = jest.fn(() => Promise.resolve(BackgroundFetchStatus.Available));
