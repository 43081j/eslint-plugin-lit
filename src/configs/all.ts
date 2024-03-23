import type {ESLint, Linter} from 'eslint';

export const configFactory = (plugin: ESLint.Plugin): Linter.FlatConfig => ({
  plugins: {
    lit: plugin
  },

  rules: {
    'lit/attribute-names': 'error',
    'lit/attribute-value-entities': 'error',
    'lit/ban-attributes': 'error',
    'lit/binding-positions': 'error',
    'lit/lifecycle-super': 'error',
    'lit/no-classfield-shadowing': 'error',
    'lit/no-duplicate-template-bindings': 'error',
    'lit/no-invalid-escape-sequences': 'error',
    'lit/no-invalid-html': 'error',
    'lit/no-legacy-imports': 'error',
    'lit/no-legacy-template-syntax': 'error',
    'lit/no-native-attributes': 'error',
    'lit/no-private-properties': 'error',
    'lit/no-property-change-update': 'error',
    'lit/no-template-arrow': 'error',
    'lit/no-template-bind': 'error',
    'lit/no-template-map': 'error',
    'lit/no-this-assign-in-render': 'error',
    'lit/no-useless-template-literals': 'error',
    'lit/no-value-attribute': 'error',
    'lit/prefer-nothing': 'error',
    'lit/prefer-static-styles': 'error',
    'lit/quoted-expressions': 'error',
    'lit/value-after-constraints': 'error'
  }
});
