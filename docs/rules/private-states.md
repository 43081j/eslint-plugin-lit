# Enforces private or protected visibility of reactive states (private-states)

By definition:

*Internal reactive state* refers to reactive properties that are not part of the
component's public API. These state properties don't have corresponding
attributes, and aren't intended to be used from outside the component. Internal
reactive state should be set by the component itself.

When following a naming convention to signify the visibility of properties,
state properties should be declared as private or protected and documented
accordingly. For example, `private` properties can be prefixed with `__` (two
underscores) and `protected` properties prefixed with `_` (one underscore).

## Rule Details

This rule enforces that all state properties defined in components are either
private, protected, or restricted to one of the two.
By default, it enforces nothing.

## Options

You can provide a regular expression to determine the visibility of a state
property. `private` and `protected` options are supported. To require all state
properties to be private, specify only the `private` option.

The following patterns are considered errors with `{ "private": "^__" }`
specified:

```ts
class Foo extends LitElement {
  static get properties() {
    return {
      fooState: {state: true}
    };
  }
}

class Foo extends LitElement {
  @state()
  accessor fooState;
}
```

The following patterns are not errors with `{ "private": "^__" }` specified:

```ts
class Foo extends LitElement {
  static get properties() {
    return {
      __privateState: {state: true},
    };
  }
}

class Foo extends LitElement {
  @state()
  accessor __privateState = 'foo';
}
```

## When Not To Use It

If you do not want to enforce per-visibility naming rules for states.
