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
    sourceType: 'module',
    ecmaVersion: 2015
  }
});

ruleTester.run('no-invalid-escape-sequences', rule, {
  valid: [
    {code: 'html`foo \\xFF bar`'},
    {code: 'html`foo \\\\0123 bar`'},
    {code: 'html`foo \\\\0o100 bar`'},
    {code: 'html`foo \\0b1101 bar`'},
    {code: 'html`foo \\u002c bar`'},
    {code: 'html`foo \\876 bar`', parserOptions: {ecmaVersion: 2018}},
    {code: 'html`foo \\0 bar`'}
  ],

  invalid: [
    {
      code: 'html`foo \\0123 bar`',
      parserOptions: {ecmaVersion: 2018},
      errors: [
        {
          messageId: 'invalid',
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 15
        }
      ],
      output: 'html`foo \\\\0123 bar`'
    },
    {
      code: 'html`foo \\3c bar`',
      parserOptions: {ecmaVersion: 2018},
      errors: [
        {
          messageId: 'invalid',
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 12
        }
      ],
      output: 'html`foo \\\\3c bar`'
    },
    {
      code: 'html`foo \\3c bar \\33`',
      parserOptions: {ecmaVersion: 2018},
      errors: [
        {
          messageId: 'invalid',
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 12
        },
        {
          messageId: 'invalid',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 21
        }
      ],
      output: 'html`foo \\\\3c bar \\\\33`'
    }
  ]
});
