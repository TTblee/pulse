module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['airbnb'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', 'prettier'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    // Indent with 4 spaces
    indent: ['error', 4],
    // Indent JSX with 4 spaces
    'react/jsx-indent': ['error', 4],

    // Indent props with 4 spaces
    'react/jsx-indent-props': ['error', 4],
    'class-methods-use-this': 0,
    'no-console': 0,
    'max-classes-per-file': 0,
  }
};
