module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',

  // File extensions Jest will look for
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Test file patterns
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],

  // Transform configuration
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  // Coverage configuration
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.test.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test environment setup
  setupFilesAfterEnv: [],
  testTimeout: 30000,

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],

  // VS Code Jest extension compatibility
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};
