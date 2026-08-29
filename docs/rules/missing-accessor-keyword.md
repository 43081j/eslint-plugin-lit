# Enforces accessor keyword on lit decorated class properties (missing-accessor-keyword)

With lit 3, if you are using standard decorators, it is required to use
`accessor` keyword on class properties decorated with lit decorators
`@property()`, `@state()`, `@query()`, `@queryAll()`, `@queryAssignedElements()`
and `@queryAssignedNodes()`.

See [lit 3 migration guide](https://lit.dev/docs/releases/upgrade/#standard-decorator-migration)
for more details.

## Rule Details

This rule enforces to put `accessor` keyword on class properties when needed.
It also provides autofix to add `accessor` keyword and can be used to migrate
a project to lit 3 and standard decorators.

The following patterns are considered as errors:

```ts
class Foo extends LitElement {
  @property({ type: String })
  fooProp = 'foo';

  @state()
  fooState;

  @query('#foo')
  fooQuery;

  @queryAll('.foo')
  fooQueryAll;

  @queryAssignedElements({slot: 'list', selector: '.item'})
  fooQueryAssignedElements;

  @queryAssignedNodes({slot: 'header', flatten: true})
  fooQueryAssignedNodes;
}
```

The following patterns are not errors:

```ts
class Foo extends LitElement {
  @property({ type: String })
  accessor fooProp = 'foo';

  @state()
  accessor fooState;

  @query('#foo')
  accessor fooQuery;

  @queryAll('.foo')
  accessor fooQueryAll;

  @queryAssignedElements({slot: 'list', selector: '.item'})
  accessor fooQueryAssignedElements;

  @queryAssignedNodes({slot: 'header', flatten: true})
  accessor fooQueryAssignedNodes;
}
```

## When Not To Use It

If you don't use standard decorators or an old version.
