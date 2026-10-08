module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  // src/test holds manual dev scripts and is excluded from tsc as well.
  ignorePatterns: ['dist', 'dist-electron', '.tmp-test', '.eslintrc.cjs', 'src/test'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // `const { id, ...rest } = obj` is the standard way to omit a key.
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Main-process / Node code: not React. Functions such as `useDb()` merely
      // start with "use" and must not be treated as React Hooks.
      files: ['electron/**', 'src/main/**', 'src/services/**', 'scripts/**'],
      env: { node: true, browser: false },
      rules: { 'react-hooks/rules-of-hooks': 'off' },
    },
  ],
}
