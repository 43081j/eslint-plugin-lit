# Enforces attribute naming conventions

Attributes are always treated lowercase, but it is common to have camelCase
property names. In these situations, an explicit lowercase attribute should
be supplied.

Further, camelCase names should ideally be exposed as snake-case attributes.

## Rule Details

This rule enforces that all lit properties have equivalent lower case attributes
exposed.

The following patterns are considered warnings:

```ts
// Using decorators:

@property() camelCaseName: string;

// Using a getter:

static get properties() {
  return {
    camelCaseName2: {type: String}
  };
}
```

The following patterns are not warnings:

```ts
@property({attribute: 'camel-case-name'})
camelCaseName: string;

@property()
lower: string;
```

## When Not To Use It

If you prefer other naming conventions for attributes, this rule should not
be used.
