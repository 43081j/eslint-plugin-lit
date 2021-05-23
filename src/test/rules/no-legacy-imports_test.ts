/**
 * @fileoverview Detects usages of legacy lit imports
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-legacy-imports');
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

ruleTester.run('no-legacy-imports', rule, {
  valid: [
    {code: 'class Foo { }'},
    {code: `import {property} from 'lit/decorators';`},
    {code: `import {state} from 'lit/decorators';`},
    {code: `import {state as bacon} from 'lit/decorators';`},
    {code: `import {LitElement} from 'lit';`},
    {code: `import {LitElement as beans} from 'lit';`},
    {code: `import * as lit from 'lit';`}
  ],

  invalid: [
    {
      code: `import {internalProperty} from 'lit-element';`,
      errors: [
        {
          messageId: 'legacyDecorator',
          data: {replacement: 'state'},
          line: 1,
          column: 9
        },
        {
          messageId: 'movedSource',
          line: 1,
          column: 32
        }
      ]
    },
    {
      code: `import {LitElement, internalProperty} from 'lit-element';`,
      errors: [
        {
          messageId: 'legacyDecorator',
          data: {replacement: 'state'},
          line: 1,
          column: 21
        },
        {
          messageId: 'movedSource',
          line: 1,
          column: 44
        }
      ]
    },
    {
      code: `import {LitElement} from 'lit-element';`,
      errors: [
        {
          messageId: 'movedSource',
          line: 1,
          column: 26
        }
      ]
    },
    {
      code: `import {property} from 'lit-element';`,
      errors: [
        {
          messageId: 'movedDecorator',
          line: 1,
          column: 9
        },
        {
          messageId: 'movedSource',
          line: 1,
          column: 24
        }
      ]
    },
    {
      code: `import {customElement} from 'lit-element';`,
      errors: [
        {
          messageId: 'movedDecorator',
          line: 1,
          column: 9
        },
        {
          messageId: 'movedSource',
          line: 1,
          column: 29
        }
      ]
    },
    {
      code: `import {eventOptions} from 'lit-element';`,
      errors: [
        {
          messageId: 'movedDecorator',
          line: 1,
          column: 9
        },
        {
          messageId: 'movedSource',
          line: 1,
          column: 28
        }
      ]
    },
    {
      code: `import * as lit from 'lit-element';`,
      errors: [
        {
          messageId: 'movedSource',
          line: 1,
          column: 22
        }
      ]
    },
    {
      code: `import * as lit from 'lit-html';`,
      errors: [
        {
          messageId: 'movedSource',
          line: 1,
          column: 22
        }
      ]
    }
  ]
});
