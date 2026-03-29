/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/{types,validation,core}/**/*.test.ts'],
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/ui/**/*.test.tsx'],
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
      moduleNameMapper: { '\\.(css|scss|sass)$': '<rootDir>/ui/__mocks__/fileMock.js' },
    },
  ],
  collectCoverageFrom: ['types/**/*.ts', 'validation/**/*.ts', 'core/**/*.ts', 'ui/**/*.tsx'],
};
