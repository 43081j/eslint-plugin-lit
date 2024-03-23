import type {ESLint} from 'eslint';

export const config: ESLint.ConfigData = {
  plugins: ['lit'],

  rules: {
    'lit/attribute-value-entities': 'error',
    'lit/binding-positions': 'error',
    'lit/no-duplicate-template-bindings': 'error',
    'lit/no-invalid-html': 'error',
    'lit/no-legacy-template-syntax': 'error',
    'lit/no-property-change-update': 'error'
  }
};
