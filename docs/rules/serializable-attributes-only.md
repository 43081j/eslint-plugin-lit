# Requires converters for non-serializable attribute types (serializable-attributes-only)

When defining a public reactive property, if the `attribute` option is enabled
(`attribute` not explicitly marked to `false`) and if the type is not natively
serializable, a converter must be provided.

## Rule Details

This rule enforces that all public reactive properties with attribute enabled
define a converter when their type is not natively serializable.

The following patterns are considered errors:

```ts
class Foo extends LitElement {
  static get properties() {
    return {
      foo: {type: Function}
    };
  }
}

class Foo extends LitElement {
  @property({type: Function, attribute: 'foo'})
  accessor foo;
}
```

The following patterns are not errors:

```ts

class Foo extends LitElement {
  static get properties() {
    return {
      foo: {type: String},
      bar: {type: Function, attribute: false},
      baz: {type: FooType, converter: (value, type) => {}},
    };
  }
}

class Foo extends LitElement {
  @property()
  accessor foo;

  @property({type: Function, attribute: false})
  accessor bar;

  @property({type: FooType, converter: {/* ... */}})
  accessor baz;
}
```

## Options

### `nativeTypes`

You can specify the list of types that are considered natively serializable and
do not require a converter.

Default value is `['String', 'Number', 'Boolean', 'Array', 'Object']`,
corresponding to types for which Lit provides built-in converters.

## When Not To Use It

If you do not want to enforce correct attribute serialization behavior, this
rule should not be used.
