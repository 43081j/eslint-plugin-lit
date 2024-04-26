/**
 * @fileoverview Disallows invalid CSS in templates
 * @author Kristján Oddsson <https://github.com/koddsson>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-invalid-css');
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

ruleTester.run('no-invalid-css', rule, {
  valid: ['css`.foobar { margin: 0 10px; }`'],

  invalid: [
    {
      code: 'css`foo bar`',
      errors: [
        {
          line: 1,
          column: 9,
          messageId: 'parseError'
        }
      ]
    },
    {
      code: 'css`.footer { 24px; color: blue; }`',
      errors: [
        {
          line: 1,
          column: 12,
          messageId: 'parseError'
        }
      ]
    },
    {
      code: 'css`.footer { margin: 24px color: blue; }`',
      errors: [
        {
          line: 1,
          column: 25,
          messageId: 'parseError'
        }
      ]
    },
    {
      code: 'css`.footer { magin: 24px; color: blue; }`',
      errors: [
        {
          line: 1,
          column: 12,
          messageId: 'parseError'
        }
      ]
    }
  ]
});
