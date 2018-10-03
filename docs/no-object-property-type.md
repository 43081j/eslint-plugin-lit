# Disallows `Object` and `Array` to be used as property types (no-object-property-type)

The `Object` and `Array` types will not automatically deserialize
or serialize as you would expect, they will instead construct instances
of their types with the string value retrieved from the attribute.

Instead, a custom serializer should be defined like so:

```ts
@property({
  type: {
    fromAttribute(val) { return JSON.parse(val); }
    toAttribute(val) { return JSON.stringify(val); }
  }
});
```

## Rule Details

This rule disallows use of `Object` and `Array` as property types.

The following patterns are considered warnings:

```ts
class Foo extends LitElement {
  static get properties() {
    return { prop: { type: Object } };
  }
}

class Bar extends LitElement {
  @property({ type: Array })
  prop = [1, 2, 3];
}
```

The following patterns are not warnings:

```ts
class Foo extends LitElement {
  static get properties() {
    return { prop: { type: Number } };
  }
}

class Bar extends LitElement {
  @property({ type: Number })
  prop = 1;
}
```

## When Not To Use It

If you intend to use the `Object` and `Array` constructors as serializers,
you will not need this rule.
