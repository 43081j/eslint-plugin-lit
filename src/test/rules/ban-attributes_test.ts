/**
 * @fileoverview Disallows a set of attributes from being used in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/ban-attributes.js';
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

ruleTester.run('ban-attributes', rule, {
  valid: [
    'css`whatever`',
    'html`foo bar`',
    'html`<x-foo attr="bar"></x-foo>`',
    'html`<x-foo attr></x-foo>`',
    'html`<x-foo ?attr=${x}></x-foo>`',
    {
      code: 'html`<x-foo attr></x-foo>`',
      options: ['attr2']
    },
    {
      code: 'html`<x-foo ?attr=${x}></x-foo>`',
      options: ['attr2']
    },
    {
      code: 'html`<x-foo .prop=${x}></x-foo>`',
      options: ['prop']
    },
    {
      code: 'html`<x-foo attr></x-foo>`',
      options: []
    }
  ],

  invalid: [
    {
      code: 'html`<x-foo attr></x-foo>`',
      options: ['attr'],
      errors: [
        {
          message: 'The attribute "attr" is not allowed in templates',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<x-foo attr="foo"></x-foo>`',
      options: ['attr'],
      errors: [
        {
          message: 'The attribute "attr" is not allowed in templates',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<x-foo ?attr=${x}></x-foo>`',
      options: ['attr'],
      errors: [
        {
          message: 'The attribute "attr" is not allowed in templates',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<x-foo attr-dashed="foo"></x-foo>`',
      options: ['attr-dashed'],
      errors: [
        {
          message: 'The attribute "attr-dashed" is not allowed in templates',
          line: 1,
          column: 13
        }
      ]
    }
  ]
});
