# Enforces that the id parameter is defined in @lit/localize msg() calls (require-id-localization-msg)

When using `@lit/localize`, the `msg` function can be used to translate strings.
When using an HTML minifier removing indent in the build process, runtime IDs
after minification can be different from `@lit/localize-tools` built IDs,
breaking the localization. By enforcing an `id` parameter in `msg()` calls,
runtime IDs are guaranteed to match the built IDs.

## Rule Details

This rule ensures that all calls to `msg()` imported from `@lit/localize`
include an `id` property in the `options` object.

Examples of **incorrect** code for this rule:

```ts
import {msg} from '@lit/localize';

msg('Hello World');
msg('Hello World', {desc: 'A greeting'});
```

Examples of **correct** code for this rule:

```ts
import {msg} from '@lit/localize';

msg('Hello World', {id: 'hello'});
```

## Options

### `onlyForTemplateLiterals`

If set to `true`, the rule will only require an `id` when the first argument of
`msg()` is a template literal. String literals will be ignored.

Default: `false`

Examples of **correct** code with `{"onlyForTemplateLiterals": true}`:

```ts
import {msg, str} from '@lit/localize';

msg('Hello World');
msg(`Hello ${name}`, {id: 'hello'});
msg(str`Hello ${name}`, {id: 'hello'});
```

Examples of **incorrect** code with `{"onlyForTemplateLiterals": true}`:

```ts
import {msg, str} from '@lit/localize';

msg(`Hello ${name}`);
msg(str`Hello ${name}`);
```

### `autoFixWithRandomId`

If set to `true`, the rule will provide an autofix that automatically adds a
randomly generated `id` (16-character base64 string) to the `options` object of
`msg()` calls. If the `options` object does not exist, it will be created.

Default: `false`

Example with `{"autoFixWithRandomId": true}`:

```ts
// Before fix:
msg('Hello World');
msg('Hello World', {desc: 'A greeting'});

// After fix:
msg('Hello World', {id: 'SkbPJwsvMgnaMcQh'});
msg('Hello World', {desc: 'A greeting', id: 'j/JPPkVetc0vfMHj'});
```

## When Not To Use It

If you do not use `@lit/localize` or if you prefer to rely on automatic ID
generation without explicit IDs.
