/**
 * @fileoverview Requires converters for non-serializable attribute types
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule} from '../../rules/serializable-attributes-only.js';
import {RuleTester} from 'eslint';
import parser from '@babel/eslint-parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2015
    }
  }
});

const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

ruleTester.run('serializable-attributes-only', rule, {
  valid: [
    'class Foo {}',
    `class Foo {
      static get properties() {
        return {
          foo: { type: Date }
        };
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return {
          fooStr: { type: String },
          fooBool: { type: Boolean },
          fooNum: { type: Number },
          fooObj: { type: Object },
          fooArr: { type: Array }
        };
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return {
          fooDate1: { type: Date, attribute: false },
          fooDate2: { type: Date, converter: (value, type) => new Date(value) },
          fooDate3: {
            type: Date,
            converter: { fromAttribute: null, toAttribute: null }
          },
        };
      }
    }`,
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            fooDate: { type: Date },
            fooType: { type: FooType },
          };
        }
      }`,
      options: [{nativeTypes: ['Date', 'FooType']}]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            fooDate: { type: Date, attribute: false },
            fooType: { type: FooType, converter: {} },
          };
        }
      }`,
      options: [{nativeTypes: ['Date']}]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        foo = 'foo';
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property()
        accessor foo;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Boolean })
        accessor foo;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            foo: { type: Date }
          };
        }
      }`,
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notSerializable'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            foo: { type: Object }
          };
        }
      }`,
      options: [{nativeTypes: ['String']}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notSerializable'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            foo: { type: Object, attribute: 'foo' },
            bar: { type: Object, converter: null },
          };
        }
      }`,
      options: [{nativeTypes: ['String']}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notSerializable'
        },
        {
          line: 5,
          column: 13,
          messageId: 'notSerializable'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Date })
        foo;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'notSerializable'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Date })
        accessor foo;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'notSerializable'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        accessor foo;
      }`,
      options: [{nativeTypes: ['Number']}],
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'notSerializable'
        }
      ]
    }
  ]
});
