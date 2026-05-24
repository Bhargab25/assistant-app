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
  },
};