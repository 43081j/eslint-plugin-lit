# Disallows invalid CSS in templates (no-invalid-css)

Templates should all contain valid CSS, if any, as it is expected
to be parsed as part of rendering.

## Rule Details

This rule disallows invalid CSS in templates.

The following patterns are considered warnings:

```ts
css`foo bar`;
css`.footer { 24px; color: blue; }`;
```

The following patterns are not warnings:

```ts
css`
  .header {
    margin: 24px;
    color: blue;
  }
`;
```

## When Not To Use It

If you don't care about invalid CSS, then you will not need this rule.
