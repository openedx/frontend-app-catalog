const { createConfig } = require('@openedx/frontend-base/tools');

module.exports = createConfig('test', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/legacy/',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/__mocks__',
    '/legacy/',
  ],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '\\.svg$': '<rootDir>/src/__mocks__/svg.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/file.js',
  },
});
