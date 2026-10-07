# Enforces boolean properties to have a false default value (boolean-property-default-false)

Property of type `boolean` should have a `false` default value.

## Rule Details

According to lit
[documentation](https://lit.dev/docs/components/properties/#boolean-attributes):

```
For a boolean property to be configurable from an attribute, it must default to
false. If it defaults to true, you cannot set it to false from markup, since the
presence of the attribute, with or without a value, equates to true. This is the
standard behavior for attributes in the web platform.
```

The following patterns are considered as errors:

```ts
class Foo extends LitElement {
  @property({ type: Boolean })
  accessor boolProp;

  @property({ type: Boolean })
  accessor boolProp2 = true;
}

class Foo extends LitElement {
  static get properties() {
    return {
      boolProp: { type: Boolean }
    };
  }
  constructor() {
    super();
    this.boolProp = true;
  }
}

class Foo extends LitElement {
  static properties = {
    boolProp: { type: Boolean }
  };
  constructor() {
    super();
    this.boolProp = true;
  }
}

// Missing constructor
class Foo extends LitElement {
  static properties = {
    boolProp: { type: Boolean }
  };
}
```

The following patterns are not errors:

```ts
class Foo extends LitElement {
  @property({ type: Boolean })
  accessor boolProp = false;

  @state()
  __boolState = true;
}

class Foo extends LitElement {
  static get properties() {
    return {
      boolProp: { type: Boolean }
    };
  }
  constructor() {
    super();
    this.boolProp = false;
  }
}

class Foo extends LitElement {
  static properties = {
    boolProp: { type: Boolean }
  };
  constructor() {
    super();
    this.boolProp = false;
  }
}
```

## When Not To Use It

If you don't care about lit recommendations, then you will not need this rule.
