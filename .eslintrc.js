module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
    jquery: true,
  },
  globals: {
    google: 'readonly',
  },
  extends: ['airbnb/base', 'prettier'],

  rules: {
    'no-underscore-dangle': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.js', '**/*.spec.js', 'webpack.config.js'],
      },
    ],
  },
};
