/**
 * @fileoverview Enforces use of `nothing` constant over empty templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/prefer-nothing');
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

ruleTester.run('prefer-nothing', rule, {
  valid: ['html`foo`', 'css``', 'nonsense``', 'html`${x}`', 'html` `'],

  invalid: [
    {
      code: 'html``',
      errors: [
        {
          messageId: 'preferNothing',
          line: 1,
          column: 1
        }
      ]
    },
    {
      code: 'const x = html``;',
      errors: [
        {
          messageId: 'preferNothing',
          line: 1,
          column: 11
        }
      ]
    },
    {
      code: 'function render() { return html``; }',
      errors: [
        {
          messageId: 'preferNothing',
          line: 1,
          column: 28
        }
      ]
    }
  ]
});
