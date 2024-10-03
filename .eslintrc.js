module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:eslint-comments/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'node_modules',
    '/target',
    '/dist/**/*',
    'src/lib/**/*',
    'npm/wasm32-wasi/runtime.js',
  ],
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
      ],
      parserOptions: {
        project: ['tsconfig.eslint.json'],
      },
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/ban-ts-comment': 'off',
        'import/no-cycle': 'error',
        '@typescript-eslint/member-ordering': 'error',
        'import/no-unresolved': ['error', { ignore: ['@lib'] }],
        '@typescript-eslint/no-for-in-array': 'error',
        'no-implied-eval': 'off',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        'require-await': 'off',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/unbound-method': 'error',
        'import/no-default-export': 'error',
        'eslint-comments/require-description': 'error',
        'eslint-comments/disable-enable-pair': 'off',
        'eslint-comments/no-unlimited-disable': 'off',
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts'],
        },
      },
      reportUnusedDisableDirectives: true,
    },
  ],
};
