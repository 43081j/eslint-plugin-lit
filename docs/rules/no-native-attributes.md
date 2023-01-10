# Disallows use of native attributes as properties (no-native-attributes)

Using global native attributes as lit properties can have unintended effects,
like for example the native `title` attribute will cause a tiny popup to show up
over your custom element, and may mess up the accessibility tree for your
component unintentionally.

## Rule Details

This rule disallows using global native attributes as lit properties.

The following patterns are considered warnings:

```ts
class MyEl extends LitElement {
  static properties = {
    title: { type: String },
    role: { type: String },
  };
}
```

The following patterns are not warnings:

```ts
class MyEl extends LitElement {
  static properties = {
    foo: { type: String },
  };
}
```

## When Not To Use It

If you don't care about overriding global native attributes.
