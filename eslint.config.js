import eslintjs from '@eslint/js';
import tseslint from 'typescript-eslint';
import {defineConfig} from 'eslint/config';
import eslintPlugin from 'eslint-plugin-eslint-plugin';

export default defineConfig([
  {
    files: ['src/**/*.ts'],
    plugins: {
      eslint: eslintjs,
      typescript: tseslint,
      'eslint-plugin': eslintPlugin
    },
    extends: [
      eslintjs.configs.recommended,
      tseslint.configs.strict,
      eslintPlugin.configs.recommended
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'eslint-plugin/require-meta-schema-description': 'off',
      'eslint-plugin/require-meta-docs-description': [
        'error',
        {
          'pattern': '^(Enforces|Requires|Disallows|Detects)'
        }
      ],
      'eslint-plugin/require-meta-docs-url': [
        'error',
        {
          'pattern': 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/{{name}}.md'
        }
      ],
      'eslint-plugin/require-meta-type': 'off'
    }
  },
  {
    files: ['src/**/*_test.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
]);
