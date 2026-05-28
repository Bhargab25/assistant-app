// src/core/testing/mocks/expo-task-manager.ts

export const isTaskDefined = jest.fn(() => true);
export const defineTask = jest.fn();
export const isTaskRegisteredAsync = jest.fn(() => Promise.resolve(true));
export const getRegisteredTasksAsync = jest.fn(() => Promise.resolve([]));
export const unregisterTaskAsync = jest.fn(() => Promise.resolve());
export const unregisterAllTasksAsync = jest.fn(() => Promise.resolve());
