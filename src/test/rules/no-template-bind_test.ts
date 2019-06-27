/**
 * @fileoverview Disallows `.bind` in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-template-bind');
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

ruleTester.run('no-template-bind', rule, {
  valid: [
    {code: 'html`foo ${someVar} bar`'},
    {code: 'html`foo bar`'},
    {code: 'html`foo ${() => {}} bar`'},
    {code: 'html`foo ${function () { }} bar`'}
  ],

  invalid: [
    {
      code: 'html`foo ${this.foo.bind(this)} bar`',
      errors: [
        {
          messageId: 'noBind',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? bar : this.baz.bind(this)} bar`',
      errors: [
        {
          messageId: 'noBind',
          line: 1,
          column: 12
        }
      ]
    }
  ]
});
