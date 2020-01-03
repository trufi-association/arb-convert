module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  collectCoverageFrom: [
    'src/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testRegex: '.test.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  setupFiles: [
    './.jest/helpers.ts',
  ],
};
