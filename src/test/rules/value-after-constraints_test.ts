/**
 * @fileoverview Enforces that `value` is bound on an input after constraints
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/value-after-constraints');
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

ruleTester.run('value-after-constraints', rule, {
  valid: [
    'css`whatever`',
    'html`foo bar`',
    'html`<x-foo max=${expr} value=${expr}>`',
    'html`<input type="number" value="123" max="100">`',
    'html`<input type="number" max="123" value="100">`',
    'html`<input type="number" value=${expr} max="100">`',
    'html`<input type="number" .value=${expr} max="100">`',
    'html`<input type="number" max="100" value=${expr}>`',
    'html`<input type="number" max="100" .value=${expr}>`',
    'html`<input type="number" value="100" max=${expr}>`',
    'html`<input type="number" value="100" .max=${expr}>`',
    'html`<input type="number" max=${expr} value="100">`',
    'html`<input type="number" .max=${expr} value="100">`',
    'html`<input type="number" max=${expr} value=${expr}>`',
    'html`<input type="number" .max=${expr} .value=${expr}>`',
    'html`<input type="number" .max=${expr} value=${expr}>`',
    'html`<input type="number" max=${expr} .value=${expr}>`'
  ],

  invalid: [
    {
      code: 'html`<input .value=${expr} min=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input .value=${expr} .min=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input value=${expr} .min=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input value=${expr} min=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input .value=${expr} max=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input .value=${expr} maxlength=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input .value=${expr} minlength=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input .value=${expr} pattern=${expr}>`',
      errors: [
        {
          messageId: 'valueAfter',
          line: 1,
          column: 13
        }
      ]
    }
  ]
});
