/**
 * @fileoverview Enforces the presence or absence of quotes around expressions
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/quoted-expressions.js';
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
    'html`<x-foo></x-foo>`',
    'html`<x-foo attr=${v}></x-foo>`',
    'html`<x-foo .prop=${v}></x-foo>`',
    'html`<x-foo @event=${v}></x-foo>`',
    'html`<x-foo attr=${v} attr2=${v}></x-foo>`',
    'html`\n<x-foo\nattr=${v}></x-foo>`',
    'html`<x-foo attr="foo ${v} bar"></x-foo>`',
    'html`<x-foo attr="${v} bar"></x-foo>`',
    'html`<p>something with "${v}" here</p>`;',
    {
      code: 'html`<p>${expr}</p>`',
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="${v}"></x-foo>`',
      options: ['always']
    },
    {
      code: "html`<x-foo attr='${v}'></x-foo>`",
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="${v} foo">${expr}</x-foo>`',
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="foo ${v} bar">${expr}</x-foo>`',
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="foo ${v}${w} bar">${expr}</x-foo>`',
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="foo ${v} bar ${w} baz">${expr}</x-foo>`',
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="${v ? "foo" : "bar"} baz">${expr}</x-foo>`',
      options: ['always']
    },
    {
      code: 'html`<x-foo attr="foo ${v}">${expr}</x-foo>`',
      options: ['always']
    },
    {
      code: 'html`<p attr="${v} foo">${expr}</p>`',
      options: ['never']
    },
    {
      code: 'html`<p attr="foo ${v} bar">${expr}</p>`',
      options: ['never']
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
