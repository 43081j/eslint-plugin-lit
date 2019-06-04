/**
 * @fileoverview Disallows invalid escape sequences in template strings
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-invalid-escape-sequences');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  }
});

ruleTester.run('no-invalid-escape-sequences', rule, {
  valid: [
    {code: 'html`foo \\\\xFF bar`'},
    {code: 'html`foo \\\\0123 bar`'},
    {code: 'html`foo \\\\0b1101 bar`'},
    {code: 'html`foo \\\\0o100 bar`'}
  ],

  invalid: [
    {
      code: 'html`foo \\0123 bar`',
      errors: [
        {
          messageId: 'invalid',
          line: 1,
          column: 5
        }
      ]
    }
  ]
});
