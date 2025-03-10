/**
 * @fileoverview Disallows invalid binding positions in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/binding-positions.js';
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
    'html`foo bar`',
    'html`<x-foo attr=${expr}>`',
    'html`<x-foo>`',
    'html`<!-- test -->`',
    'html`<!-- \\${expr} -->`',
    'html`<!-- foo -->${something}<!-- bar -->`',
    'html`<self-closing foo=${bar} />`',
    'html`<self-closing foo="${bar}"/>`'
  ],

  invalid: [
    {
      code: 'html`<x-foo ${expr}="foo">`',
      errors: [
        {
          messageId: 'noBindingAttributeName',
          line: 1,
          column: 15
        }
      ]
    },
    {
      code: 'html`<${expr}>`',
      errors: [
        {
          messageId: 'noBindingTagName',
          line: 1,
          column: 9
        }
      ]
    },
    {
      code: 'html`<${expr} foo="bar">`',
      errors: [
        {
          messageId: 'noBindingTagName',
          line: 1,
          column: 9
        }
      ]
    },
    {
      code: 'html`<x-foo></${expr}>`',
      errors: [
        {
          messageId: 'noBindingTagName',
          line: 1,
          column: 17
        }
      ]
    },
    {
      code: 'html`<!-- ${foo} -->`',
      errors: [
        {
          messageId: 'noBindingHTMLComment',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<some-element foo=${bar}/>`',
      errors: [
        {
          messageId: 'noBindingSelfClosingTag',
          line: 1,
          column: 26
        }
      ]
    }
  ]
});
