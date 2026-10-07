import type {ESLint, Linter} from 'eslint';

export const configFactory = (plugin: ESLint.Plugin): Linter.FlatConfig => ({
  plugins: {
    lit: plugin
  },

  rules: {
    'lit/attribute-value-entities': 'error',
    'lit/binding-positions': 'error',
    'lit/boolean-property-default-false': 'error',
    'lit/no-duplicate-template-bindings': 'error',
    'lit/no-invalid-html': 'error',
    'lit/no-legacy-template-syntax': 'error',
    'lit/no-property-change-update': 'error'
  }
});
