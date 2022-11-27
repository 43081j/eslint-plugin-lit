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

const parser = require.resolve('@babel/eslint-parser');
const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [
      ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}]
    ]
  }
};

ruleTester.run('no-property-change-update', rule, {
  valid: [
    'class Foo { }',
    `class Foo {
        static get properties() {
          return { prop: { type: Number } };
        }
        update() {
          this.prop = 5;
        }
      }`,
    `class Foo extends LitElement {
        update() {
          super.update();
          this.prop = 5;
        }
      }`,
    `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: Number } };
        }
        update() {
          super.update();
          this.prop2 = 5;
        }
      }`,
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        prop = 'test';
        update() {
          super.update();
          this.prop2 = 5;
        }
      }`,
      parser,
      parserOptions
    },
    `class Foo extends LitElement {
      static get properties() {
        return { prop: { type: String } };
      }
      update() {
        this.prop = 'foo';
        super.update();
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return { prop: { type: String } };
      }
      someMethod() {
        super.update();
      }
      update() {
        this.prop = 'foo';
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return { prop: { type: String } };
      }
      static update() {
        super.update();
        this.prop = 'foo';
      }
    }`
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return { prop: { type: String } };
        }
        update() {
          super.update();
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'propertyChange',
          line: 7,
          column: 11
        }
      ]
    },
    {
      code: `const x = class extends LitElement {
        static get properties() {
          return { prop: { type: String } };
        }
        update() {
          super.update();
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'propertyChange',
          line: 7,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        prop = 'foo';
        update() {
          super.update();
          this.prop = 'bar';
        }
      }`,
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'propertyChange',
          line: 6,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @internalProperty()
        prop = 'foo';
        update() {
          super.update();
          this.prop = 'bar';
        }
      }`,
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'propertyChange',
          line: 6,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        prop = 'foo';
        update() {
          super.update();
          this.prop = 'bar';
        }
      }`,
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'propertyChange',
          line: 6,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @state()
        prop = 'foo';
        update() {
          super.update();
          this.prop = 'bar';
        }
      }`,
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'propertyChange',
          line: 6,
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
          super.update();
          this.prop = 'foo';
        }
      }`,
      errors: [
        {
          messageId: 'propertyChange',
          line: 7,
          column: 11
        }
      ]
    }
  ]
});
