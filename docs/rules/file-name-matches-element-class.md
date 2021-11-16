# Disallow different name between the class of the lit element and the filename (file-name-matches-element-class)

It's hard to find a class name when the filename does not match (very useful in typescript).

## Rule Details

This rule disallows use of name between file and class.

The following patterns are considered warnings:

```ts
  // filename: my-file.ts
  @customElement('not-foo-bar')
  class FooBarElement extends LitElement {}

  // filename: my-file.js
  class FooBarElement extends LitElement {}
  customElements.define('not-foo-bar');
```

The following patterns are not warnings:

```ts
  // filename: foo-bar.ts
  @customElement('foo-bar')
  class FooBarElement extends LitElement {}

  // filename: foo-bar.js
  class FooBarElement extends LitElement {}
  customElements.define('foo-bar');
```

## Options

You can specify the format of the name of the file `['none', 'snake', 'kebab', 'pascal']`

## When Not To Use It

If you don't care about filename vs element name. 
