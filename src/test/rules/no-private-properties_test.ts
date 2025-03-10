/**
 * @fileoverview Disallows usages of "non-public" property bindings
 * @author Michael Stramel <https://github.com/stramel>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/no-private-properties.js';
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

ruleTester.run('no-private-properties', rule, {
  valid: [
    'html`<x-foo .bar=${true} ?foo=${true} @baz=${fn}></x-foo>`',
    'html`<x-foo></x-foo>`',
    'html`<x-foo bar baz></x-foo>`',
    'html`<x-foo bar baz=${true}></x-foo>`',
    'html`<x-foo ._bar=${x} .__baz=${y}></x-foo>`',
    {
      code: 'html`<x-foo _bar=${x} __baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ]
    },
    {
      code: 'html`<x-foo ?_bar=${x} ?__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ]
    },
    {
      code: 'html`<x-foo @_bar=${x} @__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ]
    }
  ],

  invalid: [
    {
      code: 'html`<x-foo ._bar=${x} .__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ],
      errors: [
        {
          messageId: 'noPrivate',
          line: 1,
          column: 13
        },
        {
          messageId: 'noPrivate',
          line: 1,
          column: 24
        }
      ]
    },
    {
      code: 'html`<x-foo ._protected_bar=${x} .__private__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__private__',
          protected: '^_protected_'
        }
      ],
      errors: [
        {
          messageId: 'noPrivate',
          line: 1,
          column: 13
        },
        {
          messageId: 'noPrivate',
          line: 1,
          column: 34
        }
      ]
    }
  ]
});
