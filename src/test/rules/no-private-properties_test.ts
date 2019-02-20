/**
 * @fileoverview Detects usages of "non-public" properties
 * @author Michael Stramel <https://github.com/stramel>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-private-properties');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  }
});

ruleTester.run('no-private-properties', rule, {
  valid: [
    {code: 'html`<x-foo .bar=${true} ?foo=${true} @baz=${fn}></x-foo>`'},
    {code: 'html`<x-foo></x-foo>`'},
    {code: 'html`<x-foo bar baz></x-foo>`'},
    {code: 'html`<x-foo bar baz=${true}></x-foo>`'}
  ],

  invalid: [
    {
      code: 'html`<x-foo _bar=${x} __baz=${y}></x-foo>`',
      errors: [
        {
          messageId: 'unsupported',
          line: 1,
          column: 5
        },
        {
          messageId: 'unsupported',
          line: 1,
          column: 21
        }
      ]
    },
    {
      code: 'html`<x-foo ._bar=${x} .__baz=${y}></x-foo>`',
      errors: [
        {
          messageId: 'unsupported',
          line: 1,
          column: 5
        },
        {
          messageId: 'unsupported',
          line: 1,
          column: 22
        }
      ]
    },
    {
      code: 'html`<x-foo ?_bar=${x} ?__baz=${y}></x-foo>`',
      errors: [
        {
          messageId: 'unsupported',
          line: 1,
          column: 5
        },
        {
          messageId: 'unsupported',
          line: 1,
          column: 22
        }
      ]
    },
    {
      code: 'html`<x-foo @_bar=${x} @__baz=${y}></x-foo>`',
      errors: [
        {
          messageId: 'unsupported',
          line: 1,
          column: 5
        },
        {
          messageId: 'unsupported',
          line: 1,
          column: 22
        }
      ]
    }
  ]
});
