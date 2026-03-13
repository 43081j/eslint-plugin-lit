/**
 * @fileoverview Requires use of query decorators instead of manual DOM queries
 * @author Kirill Karpov <https://github.com/null0rUndefined>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {fileURLToPath} from 'node:url';
import {rule} from '../../rules/prefer-query-decorators.js';
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  }
});

const parser = fileURLToPath(import.meta.resolve('@babel/eslint-parser'));
const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

ruleTester.run('prefer-query-decorators', rule, {
  valid: [
    `class Foo {}`,
    `class Foo extends LitElement {}`,
    `class Foo {
      someMethod() {
        return this.shadowRoot.querySelector('.slot');
      }
    }`,
    `class Foo extends LitElement {
      someMethod() {
        return document.querySelector('.foo');
      }
    }`,
    `class Foo extends LitElement {
      someMethod() {
        return this.querySelector('.foo');
      }
    }`,
    `class Foo extends LitElement {
      someMethod() {
        const el = document.createElement('div');
        return el.shadowRoot.querySelector('.foo');
      }
    }`,
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('.slot');
        }
      }`,
      options: [{querySelector: false}]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelectorAll('.items');
        }
      }`,
      options: [{querySelectorAll: false}]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('slot').assignedElements();
        }
      }`,
      options: [{assignedElements: false}]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('slot').assignedNodes();
        }
      }`,
      options: [{assignedNodes: false}]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('.slot');
        }
      }`,
      options: [
        {
          querySelector: false,
          querySelectorAll: false,
          assignedElements: false,
          assignedNodes: false
        }
      ]
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('.foo');
        }
      }`,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.renderRoot.querySelector('.foo');
        }
      }`,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'renderRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelectorAll('.items');
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAll',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.renderRoot.querySelectorAll('.items');
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAll',
          data: {root: 'renderRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('slot').assignedElements();
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAssignedElements',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.renderRoot.querySelector('slot').assignedElements();
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAssignedElements',
          data: {root: 'renderRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('slot').assignedNodes();
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAssignedNodes',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.renderRoot.querySelector('slot').assignedNodes();
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAssignedNodes',
          data: {root: 'renderRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot?.querySelector('.foo');
        }
      }`,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot?.querySelectorAll('.items');
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAll',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot?.querySelector('slot').assignedElements();
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAssignedElements',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot?.querySelector('slot').assignedNodes();
        }
      }`,
      errors: [
        {
          messageId: 'preferQueryAssignedNodes',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `@customElement('foo-bar')
      class Foo extends FooElement {
        someMethod() {
          return this.shadowRoot.querySelector('.foo');
        }
      }`,
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 4,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends A(LitElement) {
        someMethod() {
          return this.shadowRoot.querySelector('.foo');
        }
      }`,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends SubClass {
        someMethod() {
          return this.shadowRoot.querySelector('.foo');
        }
      }`,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ],
      settings: {
        lit: {
          elementBaseClasses: ['SubClass']
        }
      }
    },
    {
      code: `class Outer extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('.foo');
        }
      }`,
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelector('.foo');
        }
      }`,
      options: [{querySelectorAll: false}],
      errors: [
        {
          messageId: 'preferQuery',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        someMethod() {
          return this.shadowRoot.querySelectorAll('.items');
        }
      }`,
      options: [{querySelector: false}],
      errors: [
        {
          messageId: 'preferQueryAll',
          data: {root: 'shadowRoot'},
          line: 3,
          column: 18
        }
      ]
    }
  ]
});
