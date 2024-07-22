/**
 * @fileoverview Enforces calling `super` in lifecycle methods
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/lifecycle-super');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015
  }
});

const parser = require.resolve('@babel/eslint-parser');
const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

ruleTester.run('lifecycle-super', rule, {
  valid: [
    'class Foo { }',
    `class Foo {
      connectedCallback() {}
    }`,
    'class Foo extends Bar { }',
    `class Foo extends LitElement {
      static connectedCallback() {
        5;
      }
    }`,
    `class Foo extends LitElement {
      connectedCallback() {
        super.connectedCallback();
      }
    }`,
    `class Foo extends LitElement {
      disconnectedCallback() {
        super.disconnectedCallback();
      }
    }`,
    `class Foo extends LitElement {
      update() {
        super.update();
      }
    }`,
    `class Foo extends LitElement {
      otherMethod() {
        super.otherMethod();
      }
    }`
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        connectedCallback() {
          808;
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'connectedCallback'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `const foo = class extends LitElement {
        connectedCallback() {
          808;
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'connectedCallback'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        update() {
          808;
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'update'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        disconnectedCallback() {
          808;
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'disconnectedCallback'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        disconnectedCallback() {
          808;
        }
        connectedCallback() {
          808;
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'disconnectedCallback'},
          line: 2,
          column: 9
        },
        {
          messageId: 'callSuper',
          data: {method: 'connectedCallback'},
          line: 5,
          column: 9
        }
      ]
    },
    {
      code: `const foo = class extends LitElement {
        update() {
          808;
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'update'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        connectedCallback() {
          super.somethingElse();
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'connectedCallback'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        connectedCallback() {
          super.foo.connectedCallback();
        }
      }`,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'connectedCallback'},
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: `@customElement('foo')
      class Foo extends FooElement {
        connectedCallback() {
          super.foo.connectedCallback();
        }
      }`,
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'callSuper',
          data: {method: 'connectedCallback'},
          line: 3,
          column: 9
        }
      ]
    }
  ]
});
