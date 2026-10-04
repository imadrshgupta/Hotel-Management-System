/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts',
    '!src/config/database.ts',
    '!src/config/redis.ts',
    '!src/config/websocket.ts',
    '!src/config/storage.ts',
    '!src/routes/**/*.ts',
    '!src/database/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary'],
  verbose: true,
};
