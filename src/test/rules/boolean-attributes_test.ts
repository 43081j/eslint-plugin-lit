/**
 * @fileoverview Use boolean attribute expressions only with HTML bool attribute
 * @author Alican Erdogan <https://github.com/alicanerdogan>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/boolean-attributes');
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

ruleTester.run('boolean-attributes', rule, {
  valid: [
    'html`<x-foo ?hidden=${true}></x-foo>`',
    'html`<x-foo ?disabled=${true}></x-foo>`',
    'html`<x-foo ?disabled=${false}></x-foo>`',
    'html`<x-foo ?multiple=${false}></x-foo>`',
    'html`<x-foo .isFlag=${true}></x-foo>`',
    'html`<x-foo .isFlag=${false}></x-foo>`',
    'html`<x-foo></x-foo>`',
    {
      code: 'html`<x-foo ?isFlag=${false}></x-foo>`',
      options: [{exclude: ['isFlag']}]
    }
  ],

  invalid: [
    {
      code: 'html`<x-foo ?isFlag=${true}></x-foo>`',
      options: [{}],
      errors: [
        {
          messageId: 'booleanAttribute',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<x-foo ?isFlag=${false}></x-foo>`',
      options: [{}],
      errors: [
        {
          messageId: 'booleanAttribute',
          line: 1,
          column: 13
        }
      ]
    }
  ]
});
