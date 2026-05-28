const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^expo-sqlite$": "<rootDir>/src/core/testing/mocks/expo-sqlite.ts",
    "^expo-notifications$": "<rootDir>/src/core/testing/mocks/expo-notifications.ts",
    "^react-native$": "<rootDir>/src/core/testing/mocks/react-native.ts",
    "^@react-navigation/native$": "<rootDir>/src/core/testing/mocks/react-navigation-native.ts",
    "^expo-av$": "<rootDir>/src/core/testing/mocks/expo-av.ts",
    "^expo-brightness$": "<rootDir>/src/core/testing/mocks/expo-brightness.ts",
    "^expo-location$": "<rootDir>/src/core/testing/mocks/expo-location.ts",
    "^expo-speech$": "<rootDir>/src/core/testing/mocks/expo-speech.ts",
    "^expo-background-fetch$": "<rootDir>/src/core/testing/mocks/expo-background-fetch.ts",
    "^expo-task-manager$": "<rootDir>/src/core/testing/mocks/expo-task-manager.ts",
  },
};