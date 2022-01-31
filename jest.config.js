module.exports = {
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*Test.[jt]s'],
  moduleFileExtensions: ['js', 'ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
}
