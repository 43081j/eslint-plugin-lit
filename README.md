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

* lit/template-no-literal
* lit/template-no-bind
* lit/template-duplicate-bindings
* lit/template-legacy-binding-syntax

* lit/template-no-ternary
* lit/template-no-map
* lit/property-type
