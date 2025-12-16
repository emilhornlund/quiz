// jest.config.cjs
// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(e2e-)?spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@quiz/common(.*)$': '<rootDir>/../../common/src$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/*.module.ts',
    '!**/*.(e2e-)?spec.{ts,js}',
    '!**/index.ts',
    '!**/main.ts',
    '!**/instrument.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!(@quiz/common|uuid)/)'],
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
