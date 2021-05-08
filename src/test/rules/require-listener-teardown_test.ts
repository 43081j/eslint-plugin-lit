/**
 * @fileoverview Requires that listeners be cleaned up on DOM disconnect
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/require-listener-teardown');
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

ruleTester.run('require-listener-teardown', rule, {
  valid: [
    {
      code: `class Foo extends HTMLElement {
      connectedCallback() {
        this.addEventListener('x', console.log);
      }
      disconnectedCallback() {
        this.removeEventListener('x', console.log);
      }
    }`
    },
    {
      code: `class Foo extends HTMLElement {
      unknownMethod() {
        this.addEventListener('x', console.log);
      }
    }`
    },
    {code: `class Foo extends HTMLElement {}`},
    {
      code: `class Foo extends Unknown {
      connectedCallback() {
        this.addEventListener('x', console.log);
      }
      disconnectedCallback() {
        this.removeEventListener('x', console.log);
      }
    }`
    },
    // TODO (43081j): one day add some more accuracy so we can also
    // detect this case as invalid
    {
      code: `class Foo extends Unknown {
      connectedCallback() {
        this.something.addEventListener('x', console.log);
      }
    }`
    }
  ],

  invalid: [
    {
      code: `class Foo extends HTMLElement {
        connectedCallback() {
          this.addEventListener('x', console.log);
        }
      }`,
      errors: [
        {
          messageId: 'noTeardown',
          line: 3,
          column: 11
        }
      ]
    },
    {
      code: `class Foo extends Unknown {
        connectedCallback() {
          this.addEventListener('x', console.log);
        }
      }`,
      errors: [
        {
          messageId: 'noTeardown',
          line: 3,
          column: 11
        }
      ]
    },
    {
      code: `const foo = class extends HTMLElement {
        connectedCallback() {
          this.addEventListener('x', console.log);
        }
      }`,
      errors: [
        {
          messageId: 'noTeardown',
          line: 3,
          column: 11
        }
      ]
    },
    {
      code: `const foo = class extends Unknown {
        connectedCallback() {
          this.addEventListener('x', console.log);
        }
      }`,
      errors: [
        {
          messageId: 'noTeardown',
          line: 3,
          column: 11
        }
      ]
    }
  ]
});
