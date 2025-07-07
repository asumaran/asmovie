// Jest configuration for VS Code workspace
// This file allows Jest to work from the workspace root and find the API tests

const path = require('path');

module.exports = {
  projects: [
    {
      displayName: 'API',
      rootDir: path.join(__dirname, 'apps/api'),
      preset: 'ts-jest',
      testEnvironment: 'node',

      // Test file patterns - look for tests in src directory
      testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],

      // Transform configuration
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },

      // Module resolution
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },

      // Coverage
      collectCoverageFrom: [
        '<rootDir>/src/**/*.(t|j)s',
        '!<rootDir>/src/**/*.spec.ts',
        '!<rootDir>/src/**/*.test.ts',
      ],
      coverageDirectory: '<rootDir>/coverage',

      // Ignore patterns
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],

      // Other settings
      moduleFileExtensions: ['js', 'json', 'ts'],
      setupFilesAfterEnv: [],
    },
  ],
};
