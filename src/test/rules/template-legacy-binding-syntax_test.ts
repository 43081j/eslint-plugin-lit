/**
 * @fileoverview Detects usages of legacy binding syntax
 * @author James Garbutt <htttps://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/template-legacy-binding-syntax');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  }
});

ruleTester.run('template-legacy-binding-syntax', rule, {
  valid: [
    {code: 'html`<x-foo .bar=${true} ?foo=${true} @baz=${fn}>`'},
    {code: 'html`<x-foo>`'},
    {code: 'html`<x-foo bar baz>`'},
    {code: 'html`<x-foo bar baz=${true}>`'},
  ],

  invalid: [
    {
      code: 'html`<x-foo bar$=${x}>`',
      errors: [
        {
          message: 'Legacy lit-extended syntax is unsupported, did you mean to use "bar="?',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo bar?=${x}>`',
      errors: [
        {
          message: 'Legacy lit-extended syntax is unsupported, did you mean to use "?bar="?',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo on-bar=${fn}>`',
      errors: [
        {
          message: 'Legacy lit-extended syntax is unsupported, did you mean to use "@bar="?',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo><x-bar ?bar=${bool} baz?=${bool}/></x-foo>`',
      errors: [
        {
          message: 'Legacy lit-extended syntax is unsupported, did you mean to use "?baz="?',
          line: 1,
          column: 31
        }
      ]
    }
  ]
});
