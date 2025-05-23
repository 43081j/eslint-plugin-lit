/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/attribute-value-entities.js';
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

ruleTester.run('attribute-value-entities', rule, {
  valid: [
    'html`foo bar`',
    'html`<x-foo attr="bar"></x-foo>`',
    'html`<x-foo attr="bar&amp;baz"></x-foo>`',
    'html`<x-foo attr="bar&#52;baz"></x-foo>`',
    'html`<x-foo attr="bar&gt;baz"></x-foo>`',
    "html`<x-foo attr=${'>'}></x-foo>`",
    'html`<x-foo attr="()"></x-foo>`',
    'html`<x-foo attr></x-foo>`',
    'html`<svg viewBox="0 0 48 48"></svg>`',
    'html`<svg xlink:href="abc"></svg>`',
    'html`<x-foo attr="double\'quotes"></x-foo>`',
    "html`<x-foo attr='single\"quotes'></x-foo>`",
    'html`<x-foo unquoted=foo></x-foo>`'
  ],

  invalid: [
    {
      code: 'html`<x-foo attr=">"></x-foo>`',
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<x-foo attr="<"></x-foo>`',
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: 'html`<x-foo attr="&"></x-foo>`',
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 13
        }
      ]
    },
    {
      code: "html`<x-foo attr='>'></x-foo>`",
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 13
        }
      ]
    }
  ]
});
