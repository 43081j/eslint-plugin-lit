<div align="center">
  <img src="media/eslint-lit.svg" alt="Eslint + Lit" width="425" height="175" />
</div>

# `eslint-plugin-lit`

[![npm version](https://img.shields.io/npm/v/eslint-plugin-lit.svg?style=flat)](https://npmjs.org/package/eslint-plugin-lit 'View this project on npm')
[![Build Status](https://travis-ci.com/43081j/eslint-plugin-lit.svg?branch=master)](https://travis-ci.com/43081j/eslint-plugin-lit)
[![Coverage Status](https://coveralls.io/repos/github/43081j/eslint-plugin-lit/badge.svg?branch=master)](https://coveralls.io/github/43081j/eslint-plugin-lit?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ESLint plugin for [Lit](https://lit.dev/).

## Install

Assuming you already have ESLint installed, run:

```sh
# npm
npm install eslint-plugin-lit --save-dev

# yarn
yarn add eslint-plugin-lit --dev
```

## Usage

Then extend the recommended eslint config:

```js
{
  "extends": [
    // ...
    "plugin:lit/recommended"
  ]
}
```

Or if you're using (flat) config files, add to your `eslint.config.js`:

```ts
import {configs} from 'eslint-plugin-lit';

export default [
  configs['flat/recommended'],

  // or if you want to specify `files`, or other options
  {
    ...configs['flat/recommended'],
    files: ['test/**/*.js']
  }
];
```

You can also specify settings that will be shared across all the plugin rules.

```json5
{
  settings: {
    lit: {
      elementBaseClasses: ['ClassExtendingLitElement'] // Recognize `ClassExtendingLitElement` as a sub-class of LitElement
    }
  }
}
```

### Custom Configuration

If you want more fine-grained configuration, you can instead add a snippet like this to your ESLint configuration file:

```js
{
  "plugins": [
    // ...
    "lit"
  ],
  "rules": {
    // ...
    "lit/no-legacy-template-syntax": "error",
    "lit/no-template-arrow": "warn"
  }
}
```

## List of supported rules

- [lit/attribute-names](docs/rules/attribute-names.md)
- [lit/attribute-value-entities](docs/rules/attribute-value-entities.md)
- [lit/ban-attributes](docs/rules/ban-attributes.md)
- [lit/binding-positions](docs/rules/binding-positions.md)
- [lit/lifecycle-super](docs/rules/lifecycle-super.md)
- [lit/no-classfield-shadowing](docs/rules/no-classfield-shadowing.md)
- [lit/no-duplicate-template-bindings](docs/rules/no-duplicate-template-bindings.md)
- [lit/no-invalid-escape-sequences](docs/rules/no-invalid-escape-sequences.md)
- [lit/no-invalid-html](docs/rules/no-invalid-html.md)
- [lit/no-legacy-imports](docs/rules/no-legacy-imports.md)
- [lit/no-legacy-template-syntax](docs/rules/no-legacy-template-syntax.md)
- [lit/no-native-attributes](docs/rules/no-native-attributes.md)
- [lit/no-private-properties](docs/rules/no-private-properties.md)
- [lit/no-property-change-update](docs/rules/no-property-change-update.md)
- [lit/no-template-arrow](docs/rules/no-template-arrow.md)
- [lit/no-template-bind](docs/rules/no-template-bind.md)
- [lit/no-template-map](docs/rules/no-template-map.md)
- [lit/no-this-assign-in-render](docs/rules/no-this-assign-in-render.md)
- [lit/no-useless-template-literals](docs/rules/no-useless-template-literals.md)
- [lit/no-value-attribute](docs/rules/no-value-attribute.md)
- [lit/prefer-nothing](docs/rules/prefer-nothing.md)
- [lit/quoted-expressions](docs/rules/quoted-expressions.md)
- [lit/value-after-constraints](docs/rules/value-after-constraints.md)

## Shareable configurations

### Recommended

This plugin exports a `recommended` configuration that enforces Lit good practices.

To enable this configuration use the `extends` property in your `.eslintrc` config file:

```js
{
  "extends": ["eslint:recommended", "plugin:lit/recommended"]
}
```

## Usage with `eslint-plugin-wc`

We **highly** recommend you also depend on
[eslint-plugin-wc](https://github.com/43081j/eslint-plugin-wc) as it will
provide additional rules for web components in general:

```sh
npm i -D eslint-plugin-wc
```

Then extend the recommended eslint config:

```json
{
  "extends": ["plugin:wc/recommended", "plugin:lit/recommended"]
}
```

## License

MIT
