/**
 * @fileoverview Disallows invalid binding positions in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/binding-positions');
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

ruleTester.run('binding-positions', rule, {
  valid: [
    {code: 'html`foo bar`'},
    {code: 'html`<x-foo attr=${expr}>`'},
    {code: 'html`<x-foo>`'},
    {code: 'html`<!-- test -->`'},
    {code: 'html`<!-- \\${expr} -->`'},
    {code: 'html`<!-- foo -->${something}<!-- bar -->`'},
    {code: 'html`<self-closing foo=${bar} />`'},
    {code: 'html`<self-closing foo="${bar}"/>`'}
  ],

  invalid: [
    {
      code: 'html`<x-foo ${expr}="foo">`',
      errors: [
        {
          message: 'Bindings cannot be used in place of attribute names.',
          line: 1,
          column: 15
        }
      ]
    },
    {
      code: 'html`<${expr}>`',
      errors: [
        {
          message: 'Bindings cannot be used in place of tag names.',
          line: 1,
          column: 9
        }
      ]
    },
    {
      code: 'html`<${expr} foo="bar">`',
      errors: [
        {
          message: 'Bindings cannot be used in place of tag names.',
          line: 1,
          column: 9
        }
      ]
    },
    {
      code: 'html`<x-foo></${expr}>`',
      errors: [
        {
          message: 'Bindings cannot be used in place of tag names.',
          line: 1,
          column: 17
        }
      ]
    },
    {
      code: 'html`<!-- ${foo} -->`',
      errors: [
        {
          message: 'Bindings cannot be used inside HTML comments.',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<some-element foo=${bar}/>`',
      errors: [
        {
          message:
            'Bindings at the end of a self-closing tag must be' +
            ' followed by a space or quoted',
          line: 1,
          column: 26
        }
      ]
    }
  ]
});
