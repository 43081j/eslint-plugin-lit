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
    {code: `import {state} from 'lit/decorators';`}
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
        }
      ]
    }
  ]
});
