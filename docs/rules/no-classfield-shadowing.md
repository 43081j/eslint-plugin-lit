# Disallows class fields with same name as static properties

Using class fields with same name as static property can have unintended effects.

## Rule Details

This rule disallows class fields with same name as static properties.

The following patterns are considered warnings:

```ts
class MyEl extends LitElement {
  foo;

  static properties = {
    foo: {}
  }
}
```

The following patterns are not warnings:

```ts
class MyEl extends LitElement {
  static properties = {
    foo: {}
  }
}
```

## When Not To Use It

If you don't care about class fields with same name as static properties.
