# Disallows definition of "non-public" property (no-private-properties-definition)

Public reactive properties are part of a component's public API and are intended
to be used externally.

When following a naming convention to signify the visibility of properties,
public reactive properties should not be declared as private or protected. For
example, `private` properties can be prefixed with `__` (two underscores) and
`protected` properties prefixed with `_` (one underscore).

## Rule Details

This rule enforces that all public reactive properties defined in components are
not private or protected. If both `private` and `protected` are specified, a
property matching either pattern is considered non-public.
By default, it enforces nothing.

## Options

You can provide a regular expression to determine the visibility of a property.
`private` and `protected` options are supported.

The following patterns are considered errors with
`{ "private": "^__", "protected": "^_" }` specified:

```ts
class Foo extends LitElement {
  static get properties() {
    return {
      __foo: {type: String}
    };
  }
}

class Foo extends LitElement {
  @property()
  accessor __foo;

  @property()
  accessor _bar;
}
```

The following patterns are not errors with
`{ "private": "^__", "protected": "^_" }` specified:

```ts
class Foo extends LitElement {
  static get properties() {
    return {
      foo: {type: String},
    };
  }
}

class Foo extends LitElement {
  @property()
  accessor foo;
}
```

## When Not To Use It

If you do not want to enforce per-visibility naming rules for properties.
