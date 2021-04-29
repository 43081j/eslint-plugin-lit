/**
 * @fileoverview Enforces the presence or absence of quotes around expressions
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/quoted-expressions');
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

ruleTester.run('quoted-expressions', rule, {
  valid: [
    {code: 'html`<x-foo></x-foo>`'},
    {code: 'html`<x-foo attr=${v}></x-foo>`'},
    {code: 'html`<x-foo .prop=${v}></x-foo>`'},
    {code: 'html`<x-foo @event=${v}></x-foo>`'},
    {code: 'html`<x-foo attr=${v} attr2=${v}></x-foo>`'},
    {code: 'html`\n<x-foo\nattr=${v}></x-foo>`'},
    {code: 'html`<x-foo attr="foo ${v} bar"></x-foo>`'},
    {
      options: ['always'],
      code: 'html`<x-foo attr="${v}"></x-foo>`'
    },
    {
      options: ['always'],
      code: "html`<x-foo attr='${v}'></x-foo>`"
    }
  ],

  invalid: [
    {
      code: 'html`<x-foo attr="${v}"></x-foo>`',
      output: 'html`<x-foo attr=${v}></x-foo>`',
      errors: [
        {
          messageId: 'neverQuote',
          line: 1,
          column: 21
        }
      ]
    },
    {
      code: "html`<x-foo attr='${v}'></x-foo>`",
      output: 'html`<x-foo attr=${v}></x-foo>`',
      errors: [
        {
          messageId: 'neverQuote',
          line: 1,
          column: 21
        }
      ]
    },
    {
      code: 'html`<x-foo .prop="${v}"></x-foo>`',
      output: 'html`<x-foo .prop=${v}></x-foo>`',
      errors: [
        {
          messageId: 'neverQuote',
          line: 1,
          column: 22
        }
      ]
    },
    {
      code: "html`<x-foo .prop='${v}'></x-foo>`",
      output: 'html`<x-foo .prop=${v}></x-foo>`',
      errors: [
        {
          messageId: 'neverQuote',
          line: 1,
          column: 22
        }
      ]
    },
    {
      code: 'html`<x-foo\nattr="${v}"\n></x-foo>`',
      output: 'html`<x-foo\nattr=${v}\n></x-foo>`',
      errors: [
        {
          messageId: 'neverQuote',
          line: 2,
          column: 9
        }
      ]
    },
    {
      code: 'html`<x-foo dashed-attr="${v}"></x-foo>`',
      output: 'html`<x-foo dashed-attr=${v}></x-foo>`',
      errors: [
        {
          messageId: 'neverQuote',
          line: 1,
          column: 28
        }
      ]
    },
    {
      code: 'html`<x-foo attr=${v}></x-foo>`',
      output: 'html`<x-foo attr="${v}"></x-foo>`',
      options: ['always'],
      errors: [
        {
          messageId: 'alwaysQuote',
          line: 1,
          column: 20
        }
      ]
    },
    {
      code: 'html`<x-foo attr=${/* foo */v}></x-foo>`',
      output: 'html`<x-foo attr="${/* foo */v}"></x-foo>`',
      options: ['always'],
      errors: [
        {
          messageId: 'alwaysQuote',
          line: 1,
          column: 29
        }
      ]
    }
  ]
});
