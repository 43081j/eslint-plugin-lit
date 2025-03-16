/**
 * @fileoverview Detects usages of the `value` attribute
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/no-value-attribute.js';
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

ruleTester.run('no-value-attribute', rule, {
  valid: [
    'html`<x-foo val=5></x-foo>`',
    'html`<x-foo value=5></x-foo>`',
    'html`<x-foo value=${5}></x-foo>`',
    'html`<input .value="foo" />`',
    'html`<input .value=${val} />`',
    'html`<input value="foo" />`'
  ],

  invalid: [
    {
      code: 'html`<input value=${val} />`',
      output: 'html`<input .value=${val} />`',
      errors: [
        {
          message:
            'The `value` attribute only defines the initial value ' +
            'rather than permanently binding; you should set the `value` ' +
            'property instead via `.value`',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<input type="text" value=${val} />`',
      output: 'html`<input type="text" .value=${val} />`',
      errors: [
        {
          message:
            'The `value` attribute only defines the initial value ' +
            'rather than permanently binding; you should set the `value` ' +
            'property instead via `.value`',
          line: 1,
          column: 25
        }
      ]
    }
  ]
});
