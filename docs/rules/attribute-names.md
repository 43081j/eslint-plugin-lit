# Enforces attribute naming conventions

Attributes are always treated lowercase, but it is common to have camelCase
property names. In these situations, an explicit lowercase attribute should
be supplied.

Further, camelCase names should ideally be exposed as dash-case attributes.

If you want to force attribute to be exact styled version of property,
consider using `style` option.

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

@property({attribute: 'camel-case-other-name'})
camelCaseName: string;

@property()
lower: string;
```

## Options

You can specify `style` to one of these values `none`, `snake`, `dash` to
enforce that attribute name is the styled version of property, or `false`.

For example for a property named `camelCaseProp`, expected attribute names are:

| Style | Attribute       |
|-------|-----------------|
| none  | camelcaseprop   |
| dash  | camel-case-prop |
| snake | camel_case_prop |

The following patterns are considered warnings with `{"style": "dash"}`
specified:

```ts
// Using decorators:

@property() camelCaseName: string;

@property({attribute: 'camel-case-other-name'})
camelCaseName: string;

// Using a getter:

static get properties() {
  return {
    camelCaseName2: {type: String}
  };
}
```

The following patterns are not warnings `{"style": "dash"}` specified:

```ts
@property({attribute: 'camel-case-name'})
camelCaseName: string;

@property({attribute: false})
camelCaseName: string;

@property()
lower: string;
```

## When Not To Use It

If you prefer other naming conventions for attributes, this rule should not
be used.
