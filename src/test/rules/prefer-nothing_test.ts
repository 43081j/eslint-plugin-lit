/**
 * @fileoverview Enforces use of `nothing` constant over empty templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/prefer-nothing.js';
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
          column: 11,
          suggestions: [
            {
              messageId: 'useNothing',
              output: 'const x = nothing;'
            }
          ]
        }
      ]
    },
    {
      code: 'function render() { return html``; }',
      errors: [
        {
          messageId: 'preferNothing',
          line: 1,
          column: 28,
          suggestions: [
            {
              messageId: 'useNothing',
              output: 'function render() { return nothing; }'
            }
          ]
        }
      ]
    }
  ]
});
