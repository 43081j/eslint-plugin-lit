# Detects usages of non-public property bindings (no-private-properties)

It can be helpful to enforce naming conventions for `private` (and sometimes `protected`) members of an object. For example, prefixing private properties with a `__` allows them to be easily discerned when being inspected by tools that do not have knowledge of TypeScript (such as most debuggers).

## Rule Details

This rule allows you to enforce conventions for property names by their visibility. By default, it enforces nothing.

## Options

You can specify a regular expression to test the names of properties for each visibility level: `protected` and/or `private`.

The following patterns are considered warnings with `{ "private": "^__" }` specified:

```ts
html`
  <x-foo .__bar=${x}></x-foo>
`;
```

The following patterns are not warnings with `{ "private": "^__" }` specified:

```ts
html`
  <x-foo ?__bar=${x}></x-foo>
`;
html`
  <x-foo ._bar=${x}></x-foo>
`;
html`
  <x-foo __bar=${x}></x-foo>
`;
html`
  <x-foo @__bar=${x}></x-foo>
`;
```

## When Not To Use It

If you do not want to enforce per-visibility naming rules for properties.
