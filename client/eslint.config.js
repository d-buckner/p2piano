import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import solidPlugin from 'eslint-plugin-solid'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      solidPlugin.configs['flat/typescript']
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
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
      'import/no-duplicates': 'error',
      'no-restricted-globals': [
        'error',
        {
          name: 'requestIdleCallback',
          message: 'Import requestIdleCallback from lib/ponyfill for Safari compatibility'
        }
      ]
    },
  },
)
