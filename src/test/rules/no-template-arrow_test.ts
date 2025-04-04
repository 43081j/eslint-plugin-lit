/**
 * @fileoverview Disallows arrow functions in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/no-template-arrow.js';
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
    'html`foo ${someVar} bar`',
    'html`foo bar`',
    'html`foo ${this.fn.bind(this)} bar`'
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
