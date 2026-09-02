# Requires @localized() annotation on classes using msg() from @lit/localize (require-localized-annotation)

When using `@lit/localize`, the `msg` function can be used to translate strings.
Classes that use `msg()` should be decorated with `@localized()` to ensure
they re-render when the locale changes.

## Rule Details

This rule ensures that all classes containing calls to `msg()` imported from
`@lit/localize` have the `@localized()` decorator applied.

Examples of **incorrect** code for this rule:

```ts
import {msg} from '@lit/localize';

class MyElement extends LitElement {
  render() {
    return msg('Hello World');
  }
}
```

Examples of **correct** code for this rule:

```ts
import {msg, localized} from '@lit/localize';

@localized()
class MyElement extends LitElement {
  render() {
    return msg('Hello World');
  }
}
```

## When Not To Use It

If you do not use `@lit/localize` or if you handle locale changes through
other mechanisms.
