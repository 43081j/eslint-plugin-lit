# Disallows invalid escape sequences in template strings (no-invalid-escape-sequences)

Some escape sequences are invalid inside template strings and will
cause a parse error or similar.

An example is if we were to template octal:

```ts
html`some \2c octal`;
```

This should instead be done one of the two following ways:

```ts
html`some \\2c octal`;

// or

html`some ${'\2c'} octal`;
```

## Rule Details

This rule disallows invalid escape sequences in templates.

The following patterns are considered warnings:

```ts
html`foo \2c bar`;
html`foo \0b1101 bar`;
```

The following patterns are not warnings:

```ts
html`foo \\2c bar`;
html`foo ${'\2c'} bar`;
```

## When Not To Use It

If you don't care about invalid escape sequences, then you
will not need this rule.
