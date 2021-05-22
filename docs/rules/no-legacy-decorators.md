# Detects usages of legacy decorators (no-legacy-decorators)

Legacy lit decorators should not be used in newer versions of lit and have
been replaced.

## Rule Details

This rule disallows use of legacy lit decorators.

The following patterns are considered warnings:

```ts
class Foo {
  @internalProperty() someProp;
}
```

The following patterns are not warnings:

```ts
class Foo {
  @state() someProp;
}
```

## When Not To Use It

If you still rely on older lit, you may want to disable this rule.
