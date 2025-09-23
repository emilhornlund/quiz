// jest.config.cjs
// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/../tsconfig.test.json' },
    ],
  },
  collectCoverageFrom: ['**/*.{ts,js}', '!**/*.spec.{ts,js}'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: [],
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
