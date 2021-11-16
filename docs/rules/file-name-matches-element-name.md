# Disallow different name between the name of the lit element and the filename (file-name-matches-element-name)

It's hard to find a component name when the filename does not match. Typically when you find a component through the chrome inspector.

## Rule Details

This rule disallows use of name between file and element.

The following patterns are considered warnings:

```ts
// filename: my-file.ts
class FooBarElement extends LitElement {}

// filename: my-file.js
class FooBarElement extends LitElement {}

// filename: my-file.jsx
class FooBarElement extends LitElement {}
```

The following patterns are not warnings:

```ts
// filename: not-related.ts
class FooBarElement {}

// filename: foo-bar-element.ts
class FooBarElement LitElement {}

// filename: foo-bar-element.js
class FooBarElement LitElement {}

// filename: foo-bar-element.jsx
class FooBarElement LitElement {}

// filename: foo-bar-element.jsx
class FooBarElement SuperBehavior(LitElement) {}
```

## Options

You can specify the format of the name of the file `['none', 'snake', 'kebab', 'pascal']`

## When Not To Use It

If you don't care about filename vs class name. 
