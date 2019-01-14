# eslint-plugin-lit

[![Build Status](https://travis-ci.org/43081j/eslint-plugin-lit.svg?branch=master)](https://travis-ci.org/43081j/eslint-plugin-lit)

[lit-html](https://github.com/polymer/lit-html) support for ESLint.

**Note:** experimental, may change quite a bit.

# Install

```
$ npm i -D eslint eslint-plugin-lit
```

# Usage

Add `lit` to the plugins section of your `.eslintrc` file:

```json
{
  "plugins": [
    "lit"
  ]
}
```

Configure your rules like so:

```json
{
  "rules": {
    "lit/rule-name": "error"
  }
}
```

# Supported Rules

* [lit/no-duplicate-template-bindings](docs/no-duplicate-template-bindings.md)
* [lit/no-legacy-template-syntax](docs/no-legacy-template-syntax.md)
* [lit/no-template-bind](docs/no-template-bind.md)
* [lit/no-template-map](docs/no-template-map.md)
* [lit/no-useless-template-literals](docs/no-useless-template-literals.md)
* [lit/attribute-value-entities](docs/attribute-value-entities.md)
* [lit/binding-positions](docs/binding-positions.md)
* [lit/no-property-change-update](docs/no-property-change-update.md)
* [lit/no-invalid-html](docs/no-invalid-html.md)
* [lit/no-value-attribute](docs/no-value-attribute.md)
