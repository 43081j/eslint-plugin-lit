# Disallows arrow functions and `.bind` in templates (no-template-bind)

Passing function expressions into templates will result in them
being created every time a render occurs, resulting in performance
loss.

Instead, you should do something like so:

```ts
constructor() {
  this._boundOnClick = this._onClick.bind(this);
}

_render() {
  return html`<x-foo @event=${this._boundOnClick}>`;
}
```

## Rule Details

This rule disallows using function expressions and `.bind` in templates.

The following patterns are considered warnings:

```ts
html`<x-foo @event=${() => {}}>`;
html`<x-foo @event=${function() { }}>`;
html`<x-foo @event=${this.someMethod.bind(this)}>`;
```

The following patterns are not warnings:

```ts
html`foo ${someVar}`;
```

## When Not To Use It

If you don't care about rendering performance, then you will not need this rule.
