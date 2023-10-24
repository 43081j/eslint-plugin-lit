/**
 * @fileoverview Disallows assignments to members of `this` in render methods
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-this-assign-in-render');
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

ruleTester.run('no-this-assign-in-render', rule, {
  valid: [
    'const x = 808;',
    'class Foo { }',
    `class Foo {
        render() {
          this.prop = 5;
        }
      }`,
    `class Foo {
        render() {
          this.deep.prop = 5;
        }
      }`,
    `class Foo extends LitElement {
        render() {
          const x = this.prop;
        }
      }`,
    `class Foo extends LitElement {
        render() {
          const x = 5;
        }
      }`,
    `class Foo extends LitElement {
        static render() {
          this.foo = 5;
        }
      }`,
    `class Foo extends LitElement {
        render() {
          let x;
          x = this.prop;
        }
      }`,
    `class Foo extends LitElement {
        render() {
          let x;
          x = 5;
        }
      }`,
    `class Foo extends LitElement {
        render() {
          let x;
          x = this.foo || 123;
        }
      }`
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        render() {
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'noThis',
          line: 3,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        render() {
          this.deep.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'noThis',
          line: 3,
          column: 11
        }
      ]
    },
    {
      code: `const foo = class extends LitElement {
        render() {
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'noThis',
          line: 3,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        render() {
          this['prop'] = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'noThis',
          line: 3,
          column: 11
        }
      ]
    }
  ]
});
