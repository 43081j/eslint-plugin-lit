/**
 * @fileoverview Disallows duplicate names in template bindings
 * @author James Garbutt <htttps://github.com/43081j>
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
    sourceType: 'module'
  }
});

ruleTester.run('no-duplicate-template-bindings', rule, {
  valid: [
    {code: 'html`<x-foo .bar=${true}>`'},
    {code: 'html`foo bar`'},
    {code: 'html`<x-foo ?bar=${true} baz>`'},
    {code: 'html`<x-foo foo=${true}><x-bar foo=${true}></x-bar></x-foo>`'},
    {code: 'html`<x-foo @bar=${true}>`'}
  ],

  invalid: [
    {
      code: 'html`<x-foo bar bar>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed, "bar" was set multiple times.',
          line: 1,
          column: 1
        }
      ]
    },
    {
      code: 'html`<x-foo bar bar=${true}>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed, "bar" was set multiple times.',
          line: 1,
          column: 1
        }
      ]
    },
    {
      code: 'html`<x-foo><x-bar x=${true} y x=${true}></x-bar></x-foo>`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed, "x" was set multiple times.',
          line: 1,
          column: 1
        }
      ]
    },
    {
      code: 'html`<x-foo ?foo=${true} @foo=${true} />`',
      errors: [
        {
          message: 'Duplicate bindings are not allowed, "foo" was set multiple times.',
          line: 1,
          column: 1
        }
      ]
    }
  ]
});
