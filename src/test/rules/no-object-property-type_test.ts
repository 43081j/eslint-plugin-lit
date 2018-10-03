/**
 * @fileoverview Disallows `Object` and `Array` to be used as property types
 * @author James Garbutt <htttps://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-object-property-type');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  }
});

ruleTester.run('no-object-property-type', rule, {
  valid: [
    {code: 'class Foo { }'},
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            prop: { type: Number },
            prop2: { type: String }
          };
        }
      }`
    },
    {
      parser: 'babel-eslint',
      code: `class Foo extends LitElement {
        @property({ type: String })
        prop = 'test';
        @property({ type: Number })
        prop2 = 5;
      }`
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: Object } };
        }
      }`,
      errors: [
        {
          message: '`Array` and `Object` types will not (de)serialize as expected, a custom serializer should be used for the property: prop',
          line: 3,
          column: 34
        }
      ]
    },
    {
      parser: 'babel-eslint',
      code: `class Foo extends LitElement {
        @property({ type: Object })
        prop = {};
        @property({ type: Array })
        prop2 = [1, 2];
      }`,
      errors: [
        {
          message: '`Array` and `Object` types will not (de)serialize as expected, a custom serializer should be used for the property: prop',
          line: 2,
          column: 27
        },
        {
          message: '`Array` and `Object` types will not (de)serialize as expected, a custom serializer should be used for the property: prop2',
          line: 4,
          column: 27
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: Array } };
        }
      }`,
      errors: [
        {
          message: '`Array` and `Object` types will not (de)serialize as expected, a custom serializer should be used for the property: prop',
          line: 3,
          column: 34
        }
      ]
    }
  ]
});
