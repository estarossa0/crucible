import stylistic from '@stylistic/eslint-plugin';
import tsParser from 'typescript-eslint';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser.parser,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: ['block', 'const', 'let', 'var'],
          next: 'return',
        },
        {
          blankLine: 'always',
          prev: ['let', 'const', 'var'],
          next: ['function', 'class'],
        },
        {
          blankLine: 'always',
          prev: ['function', 'class'],
          next: ['function', 'class', 'let', 'const', 'var'],
        },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
  },
];
