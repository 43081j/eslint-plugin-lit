/**
 * @fileoverview Disallows duplicate names in template bindings
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-duplicate-template-bindings');
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

ruleTester.run('no-duplicate-template-bindings', rule, {
  valid: [
    'html`<x-foo .bar=${true}>`',
    'html`foo bar`',
    'html`<x-foo ?bar=${true} baz>`',
    'html`<x-foo foo=${true}><x-bar foo=${true}></x-bar></x-foo>`',
    'html`<x-foo @foo=${v} .foo=${v}></x-foo>`',
    'html`<x-foo @bar=${true}>`'
  ],

  invalid: [
    {
      code: 'html`<x-foo bar bar>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed.',
          line: 1,
          column: 20
        }
      ]
    },
    {
      code: 'html`<x-foo bar bar=${true}>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed.',
          line: 1,
          column: 20
        }
      ]
    },
    {
      code: 'html`<x-foo><x-bar x=${true} y x=${true}></x-bar></x-foo>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed.',
          line: 1,
          column: 33
        }
      ]
    },
    {
      code: 'html`<button @click=${fn} part="button" @click=${fn}></button>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed.',
          line: 1,
          column: 47
        }
      ]
    },
    {
      code: 'html`<button @click=${\nfn\n\n} foo @click=${fn}></button>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed.',
          line: 4,
          column: 13
        }
      ]
    },
    {
      code: 'html`<button\n@click=${\nfn\n\n} foo @click=${fn}></button>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed.',
          line: 5,
          column: 13
        }
      ]
    }
  ]
});
