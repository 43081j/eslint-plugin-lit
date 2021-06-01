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
          data: {replacement: 'lit'},
          line: 1,
          column: 32,
          endLine: 1,
          endColumn: 45
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
          data: {replacement: 'lit'},
          line: 1,
          column: 44,
          endLine: 1,
          endColumn: 57
        }
      ]
    },
    {
      code: `import {LitElement} from 'lit-element';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: 'lit'},
          line: 1,
          column: 26,
          endLine: 1,
          endColumn: 39
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
          data: {replacement: 'lit'},
          line: 1,
          column: 24,
          endLine: 1,
          endColumn: 37
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
          data: {replacement: 'lit'},
          line: 1,
          column: 29,
          endLine: 1,
          endColumn: 42
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
          data: {replacement: 'lit'},
          line: 1,
          column: 28,
          endLine: 1,
          endColumn: 41
        }
      ]
    },
    {
      code: `import * as lit from 'lit-element';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: 'lit'},
          line: 1,
          column: 22,
          endLine: 1,
          endColumn: 35
        }
      ]
    },
    {
      code: `import * as lit from 'lit-html';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: 'lit'},
          line: 1,
          column: 22,
          endLine: 1,
          endColumn: 32
        }
      ]
    },
    {
      code: `import {UpdatingElement} from 'lit-element/lib/updating-element';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: '@lit/reactive-element'},
          line: 1,
          column: 31,
          endLine: 1,
          endColumn: 65
        }
      ]
    },
    {
      code: `import {UpdatingElement} from 'lit-element/lib/updating-element.js';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: '@lit/reactive-element'},
          line: 1,
          column: 31,
          endLine: 1,
          endColumn: 68
        }
      ]
    },
    {
      code: `import {ifDefined} from 'lit-html/directives/if-defined';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: 'lit/directives/if-defined'},
          line: 1,
          column: 25,
          endLine: 1,
          endColumn: 57
        }
      ]
    },
    {
      code: `import {ifDefined} from 'lit-html/directives/if-defined.js';`,
      errors: [
        {
          messageId: 'movedSource',
          data: {replacement: 'lit/directives/if-defined.js'},
          line: 1,
          column: 25,
          endLine: 1,
          endColumn: 60
        }
      ]
    }
  ]
});
