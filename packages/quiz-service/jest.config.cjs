// jest.config.cjs
// eslint-disable-next-line no-undef
module.exports = {
  projects: ['<rootDir>/jest.json', '<rootDir>/test/jest-e2e.json'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  detectOpenHandles: true,
  forceExit: true,
}
