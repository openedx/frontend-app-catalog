const { createConfig } = require('@openedx/frontend-build');

const mergedConfig = createConfig('jest', {
  // setupFilesAfterEnv is used after the jest environment has been loaded. In general this is what you want.
  // If you want to add config BEFORE jest loads, use setupFiles instead.
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.tsx',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.tsx',
    'src/i18n',
  ],
  moduleNameMapper: {
    // This alias is for any code in the src directory that wants to avoid '../../' style relative imports:
    '^@src/(.*)$': '<rootDir>/src/$1',
  }
});

// Limit ts-jest diagnostics to test files so type errors in transformed
// dependencies (included via transformIgnorePatterns) don't fail the run.
mergedConfig.transform['^.+\\.[tj]sx?$'] = [
  'ts-jest',
  {
    diagnostics: {
      exclude: ['!**/*.test.*'],
    },
  },
];

module.exports = mergedConfig;

export {};
