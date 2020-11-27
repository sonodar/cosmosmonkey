export default {
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.[jt]s'],
  moduleFileExtensions: ['js', 'ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverage: true,
}
