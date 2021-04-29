# Disallows quoted expressions in template bindings (no-quoted-expressions)


Expressions do not need to be surrounded by quotes when being bound to
attributes and properties in templates.

## Rule Details

This rule disallows quoted expressions in template bindings.

The following patterns are considered warnings:

```ts
html`<x-foo attr="${val}"></x-foo>`;
html`<x-foo .prop="${val}"></x-foo>`;
```

The following patterns are not warnings:

```ts
html`<x-foo attr=${val}></x-foo>`;
html`<x-foo prop=${val}></x-foo>`;
```

## When Not To Use It

If you prefer to quote your values, then do not use this rule.
