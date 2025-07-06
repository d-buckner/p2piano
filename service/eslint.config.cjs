const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['dist', 'coverage', 'docs'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    plugins: {
      'import': importPlugin,
    },
    rules: {
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'eol-last': ['error', 'always'],
      'import/newline-after-import': ['error', { count: 2 }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false }
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal', 
            'parent',
            'sibling',
            'index',
            'type'
          ],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
      'import/first': 'error',
      'import/no-duplicates': 'error'
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    },
  },
  {
    files: ['**/*.service.ts', '**/*.guard.ts', '**/*.controller.ts', '**/room/*.ts', '**/signal/*.ts', '**/notes/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off'
    },
  },
);