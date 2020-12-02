export default {
  moduleNameMapper: {
    models: '<rootDir>/src/model',
  },
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*Test.[jt]s'],
  moduleFileExtensions: ['js', 'ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverage: true,
}
