/**
 * @fileoverview Detects usages of the `value` attribute
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-value-attribute');
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
    {code: 'html`<x-foo val=5></x-foo>`'},
    {code: 'html`<x-foo value=5></x-foo>`'},
    {code: 'html`<x-foo value=${5}></x-foo>`'},
    {code: 'html`<input .value="foo" />`'},
    {code: 'html`<input .value=${val} />`'},
    {code: 'html`<input value="foo" />`'}
  ],

  invalid: [
    {
      code: 'html`<input value=${val} />`',
      errors: [
        {
          message:
            'The `value` attribute only defines the initial value ' +
            'rather than permanently binding; you should set the `value` ' +
            'property instead via `.value`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<input type="text" value=${val} />`',
      errors: [
        {
          message:
            'The `value` attribute only defines the initial value ' +
            'rather than permanently binding; you should set the `value` ' +
            'property instead via `.value`',
          line: 1,
          column: 5
        }
      ]
    }
  ]
});
