// src/core/testing/mocks/react-navigation-native.ts

export const createNavigationContainerRef = () => ({
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
});
export const useNavigation = () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
});
export const useRoute = () => ({
    params: {},
});
