# eslint-plugin-lit

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

* [lit/template-no-literal](docs/template-no-literal.md)
* [lit/template-no-bind](docs/template-no-bind.md)
* [lit/template-duplicate-bindings](docs/template-duplicate-bindings.md)
* [lit/template-legacy-binding-syntax](docs/template-legacy-binding-syntax.md)
* [lit/template-no-map](docs/template-no-map.md)

# To-do

* lit/template-binding-types
* lit/template-no-ternary
* lit/property-type
