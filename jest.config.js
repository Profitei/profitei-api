module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '.*entity\\.ts$',
    '.*module\\.ts$',
    'src/main.ts',
  ],
  coverageReporters: [
    'html',
    'text',
    'text-summary',
    'cobertura',
    'clover',
    'json',
    'lcov',
  ],
  collectCoverage: true,
  eporters: [
    'default',
    [
      'jest-junit',
      {
        classNameTemplate: `{classname}`,
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        suiteNameTemplate: `${process.env.npm_package_name}`,
        includeConsoleOutput: true,
        addFileAttribute: 'true',
      },
    ],
  ],
};
