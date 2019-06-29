/**
 * @fileoverview Disallows property changes in the `update` lifecycle method
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-property-change-update');
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

const babelParser = require.resolve('babel-eslint');

ruleTester.run('no-property-change-update', rule, {
  valid: [
    {code: 'class Foo { }'},
    {
      code: `class Foo {
        static get properties() {
          return { prop: { type: Number } };
        }
        update() {
          this.prop = 5;
        }
      }`
    },
    {
      code: `class Foo extends LitElement {
        update() {
          this.prop = 5;
        }
      }`
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: Number } };
        }
        update() {
          this.prop2 = 5;
        }
      }`
    },
    {
      parser: babelParser,
      code: `class Foo extends LitElement {
        @property({ type: String })
        prop = 'test';
        update() {
          this.prop2 = 5;
        }
      }`
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: String } };
        }
        update() {
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'propertyChange',
          line: 6,
          column: 11
        }
      ]
    },
    {
      parser: babelParser,
      code: `class Foo extends LitElement {
        @property({ type: String })
        prop = 'foo';
        update() {
          this.prop = 'bar';
        }
      }`,
      errors: [
        {
          messageId: 'propertyChange',
          line: 5,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: String } };
        }
        update(change) {
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'propertyChange',
          line: 6,
          column: 11
        }
      ]
    }
  ]
});
