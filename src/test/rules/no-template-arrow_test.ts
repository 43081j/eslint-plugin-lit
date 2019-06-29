/**
 * @fileoverview Disallows arrow functions in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-template-arrow');
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

ruleTester.run('no-template-arrow', rule, {
  valid: [
    {code: 'html`foo ${someVar} bar`'},
    {code: 'html`foo bar`'},
    {code: 'html`foo ${this.fn.bind(this)} bar`'}
  ],

  invalid: [
    {
      code: 'html`foo ${() => {}} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${() => true} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${function() { }} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? function() { } : bar} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? bar : function() { }} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? (() => {}) : bar} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? bar : (() => {})} bar`',
      errors: [
        {
          messageId: 'noArrow',
          line: 1,
          column: 12
        }
      ]
    }
  ]
});
