# Requires use of query decorators instead of manual DOM queries (prefer-query-decorators)

Manually calling `this.shadowRoot.querySelector()` or `this.renderRoot.querySelector()` inside a
LitElement is verbose and error-prone. The `@query`, `@queryAll`, `@queryAssignedElements`, and
`@queryAssignedNodes` decorators are the idiomatic Lit way to access elements in the shadow DOM.

## Rule Details

This rule requires use of query decorators instead of manually querying the render root.

The following patterns are considered warnings:

```ts
class Foo extends LitElement {
  get myEl() {
    return this.shadowRoot.querySelector('.my-el');
  }

  get myEls() {
    return this.renderRoot.querySelectorAll('.my-el');
  }

  get assignedItems() {
    return this.shadowRoot.querySelector('slot').assignedElements();
  }

  get assignedItemNodes() {
    return this.renderRoot.querySelector('slot').assignedNodes();
  }
}
```

The following patterns are not warnings:

```ts
class Foo extends LitElement {
  @query('.my-el') myEl;

  @queryAll('.my-el') myEls;

  @queryAssignedElements({slot: 'items'}) assignedItems;

  @queryAssignedNodes({slot: 'items'}) assignedItemNodes;
}
```

## Options

The rule accepts an optional configuration object with boolean flags to selectively disable
individual checks. All flags default to `true`.

```json
{
  "lit/prefer-query-decorators": [
    "error",
    {
      "querySelector": true,
      "querySelectorAll": true,
      "assignedElements": true,
      "assignedNodes": true
    }
  ]
}
```

### querySelector

When `false`, disables the check for `this.shadowRoot.querySelector()` /
`this.renderRoot.querySelector()`.

### querySelectorAll

When `false`, disables the check for `this.shadowRoot.querySelectorAll()` /
`this.renderRoot.querySelectorAll()`.

### assignedElements

When `false`, disables the check for chained `.assignedElements()` calls.

### assignedNodes

When `false`, disables the check for chained `.assignedNodes()` calls.

## When Not To Use It

If you prefer to query the shadow DOM manually, or your project does not use Lit decorators.
