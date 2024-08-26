import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypescript,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
    },
  },
];
