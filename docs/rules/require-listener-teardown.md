# Requires that listeners be cleaned up on DOM disconnect (require-listener-teardown)

Event listeners should be cleaned up once a component has been removed
from DOM to prevent memory leaks.

## Rule Details

This rule requires that listeners added in `connectedCallback` are removed
in `disconnectedCallback`.

The following patterns are considered warnings:

```ts
class Foo extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this.foo);
  }
}
```

The following patterns are not warnings:

```ts
class Foo extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this.foo);
  }
  disconnectedCallback() {
    this.removeEventListener('click', this.foo);
  }
}
```

## When Not To Use It

If you don't care about teardown of listeners, do not use this rule.
