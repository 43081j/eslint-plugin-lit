/**
 * @fileoverview Disallows redundant literal values in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-useless-template-literals');
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

ruleTester.run('no-useless-template-literals', rule, {
  valid: [{code: 'html`foo ${someVar} bar`'}, {code: 'html`foo bar`'}],

  invalid: [
    {
      code: 'html`foo ${123} bar`',
      errors: [
        {
          message: 'Literals must not be substituted into templates',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${"abc"} ${true} bar`',
      errors: [
        {
          message: 'Literals must not be substituted into templates',
          line: 1,
          column: 12
        },
        {
          message: 'Literals must not be substituted into templates',
          line: 1,
          column: 21
        }
      ]
    }
  ]
});
