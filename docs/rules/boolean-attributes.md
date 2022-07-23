# Allow to use boolean attribute expressions only with standard boolean attributes (boolean-attributes)

Boolean attribute expressions (e.g `?hidden=${true}`) should only be used for standard boolean attributes
that are defined with [the HTML standard](https://html.spec.whatwg.org/#attributes-3).

The standard boolean attributes are as follows:

- allowfullscreen
- async
- autofocus
- autoplay
- checked
- controls
- default
- defer
- disabled
- formnovalidate
- hidden
- inert
- ismap
- itemscope
- loop
- multiple
- muted
- nomodule
- novalidate
- open
- playsinline
- readonly
- required
- reversed
- selected

With the boolean attribute expression, it is not possible to assign a falsy value to the attribute.
Simply the boolean attribute expression assigns a truthy value or when the value is falsy, do not execute any assignment.
For example, `<div ?hidden=${false}></div>`will be rendered as`<div></div>`. This might cause bugs that are hard to figure out when a custom boolean property is initialized with the value `true`.

## Rule Details

This rule allows you to enforce that only standard boolean attributes to be set with boolean attribute expressions.

## Options

You can specify an exclude list with options to allow certain properties to be assigned with boolean attribute expressions.

The following patterns are considered ok with `{ "exclude": ["isFlag"] }` specified:

```ts
html`<x-foo ?isFlag=${false}></x-foo>`;
```

## When Not To Use It

If you do not care whether they might be some initialization issues of custom property values,
do not use this rule.
