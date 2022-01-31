module.exports = {
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*Test.[jt]s'],
  moduleFileExtensions: ['js', 'ts'],
  transform: { '^.+\\.ts$': '@swc/jest' },
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
}
