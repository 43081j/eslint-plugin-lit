/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/tailwind-button-usage');
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

ruleTester.run('tailwind-button-usage', rule, {
  valid: ['html`button({ appearance: "plain"})`'],

  invalid: [
    {
      code: 'html`<button class="button"></button>`',
      errors: [
        {
          messageId: 'invalidTailwindUsage',
          line: 1,
          column: 1
        }
      ]
    },
    {
      code: 'html`<button class="button button-small"></button>`',
      errors: [
        {
          messageId: 'invalidTailwindUsage',
          line: 1,
          column: 1
        }
      ]
    }
  ]
});
