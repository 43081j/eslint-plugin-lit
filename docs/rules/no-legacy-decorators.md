# Detects usages of legacy decorators (no-legacy-decorators)

Legacy lit decorators should not be used in newer versions of lit and have
been replaced.

## Rule Details

This rule disallows use of legacy lit decorators.

The following patterns are considered warnings:

```ts
import {internalProperty} from 'lit-element';
```

The following patterns are not warnings:

```ts
import {state} from 'lit/decorators';
```

## When Not To Use It

If you still rely on older lit, you may want to disable this rule.
