module.exports = {
  roots: ['server'],
  preset: '@shelf/jest-mongodb',
  coverageReporters: [
    'lcov',
    'text-summary',
    ['text-summary', { file: 'text-summary.txt' }],
  ],
  watchPathIgnorePatterns: ['globalConfig'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!**/fixtures/**',
    '!**/node_modules/**',
    '!server/index.js',
    '!server/repl.js',
  ],
  coverageThreshold: {
    global: {
      branches: 89,
      functions: 87,
      lines: 91,
      statements: 90,
    },
  },
};
